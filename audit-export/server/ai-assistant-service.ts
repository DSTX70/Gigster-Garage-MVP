import OpenAI from "openai";
import { db } from "./db";
import { users, aiQuestionTemplates, aiUserResponses, aiConversations } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface ConversationContext {
  userId: string;
  contentType: string; // "proposal", "contract", etc.
  questionLevel: "basic" | "advanced";
  projectType?: string; // "construction", "marketing", etc.
  entityId?: string; // proposal/contract/project ID
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export class AiAssistantService {
  /**
   * Start a new AI-guided conversation
   */
  async startConversation(context: ConversationContext): Promise<{
    conversationId: string;
    firstQuestion: string;
    totalQuestions: number;
  }> {
    // Note: OpenAI is optional for basic Q&A flow (only needed for follow-ups and generation)

    // Load user profile for context
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, context.userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    // Load question templates
    const templates = await this.getQuestionTemplates(
      context.contentType,
      context.questionLevel,
      context.projectType
    );

    if (templates.length === 0) {
      throw new Error("No question templates found for this context");
    }

    // Create system message with user context
    const systemMessage: Message = {
      role: "system",
      content: this.buildSystemPrompt(user, context),
      timestamp: new Date().toISOString(),
    };

    // Create conversation record
    const [conversation] = await db
      .insert(aiConversations)
      .values({
        userId: context.userId,
        contentType: context.contentType,
        questionLevel: context.questionLevel,
        entityId: context.entityId,
        projectType: context.projectType,
        messages: [systemMessage],
        userProfile: {
          city: user.city || undefined,
          state: user.state || undefined,
          businessType: user.businessType || undefined,
          entityType: user.entityType || undefined,
          industry: user.industry || undefined,
          targetMarket: user.targetMarket || undefined,
        },
        status: "in_progress",
      })
      .returning();

    // Return first question
    return {
      conversationId: conversation.id,
      firstQuestion: templates[0].questionText,
      totalQuestions: templates.length,
    };
  }

  /**
   * Submit an answer and get next question or follow-up
   */
  async submitAnswer(
    conversationId: string,
    userId: string,
    answer: string,
    currentQuestionIndex: number
  ): Promise<{
    hasMore: boolean;
    nextQuestion?: string;
    followUpQuestion?: string;
    isComplete: boolean;
  }> {
    // Load conversation
    const [conversation] = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // SECURITY: Verify ownership
    if (conversation.userId !== userId) {
      throw new Error("Unauthorized: You don't own this conversation");
    }

    // Load question templates
    const templates = await this.getQuestionTemplates(
      conversation.contentType,
      conversation.questionLevel as "basic" | "advanced",
      conversation.projectType || undefined
    );

    // Validate currentQuestionIndex is within bounds
    if (currentQuestionIndex < 0 || currentQuestionIndex >= templates.length) {
      throw new Error(`Invalid question index: ${currentQuestionIndex}. Must be between 0 and ${templates.length - 1}`);
    }

    const currentQuestion = templates[currentQuestionIndex];

    // Store user response
    const userMessage: Message = {
      role: "user",
      content: answer,
      timestamp: new Date().toISOString(),
    };

    await db.insert(aiUserResponses).values({
      userId: conversation.userId,
      questionTemplateId: currentQuestion.id,
      conversationId: conversationId,
      questionText: currentQuestion.questionText,
      responseText: answer,
      context: {
        contentType: conversation.contentType,
        entityId: conversation.entityId || undefined,
        projectType: conversation.projectType || undefined,
      },
    });

    // Update conversation with user message
    const updatedMessages = [...(conversation.messages as Message[]), userMessage];

    // Determine if we should ask a follow-up or move to next question (only if OpenAI available)
    const shouldAskFollowUp = openai 
      ? await this.shouldAskFollowUp(
          answer,
          currentQuestion.questionText,
          conversation.userProfile as any
        )
      : false; // Skip follow-ups if no OpenAI

    let followUpQuestion: string | undefined;
    let nextQuestion: string | undefined;
    let isComplete = false;

    if (shouldAskFollowUp && openai) {
      // Generate intelligent follow-up question
      followUpQuestion = await this.generateFollowUp(
        answer,
        currentQuestion.questionText,
        conversation.messages as Message[],
        conversation.userProfile as any
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: followUpQuestion,
        timestamp: new Date().toISOString(),
      };

      updatedMessages.push(assistantMessage);

      await db
        .update(aiConversations)
        .set({ messages: updatedMessages })
        .where(eq(aiConversations.id, conversationId));

      return {
        hasMore: true,
        followUpQuestion,
        isComplete: false,
      };
    }

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    const hasMore = nextIndex < templates.length;

    if (hasMore) {
      nextQuestion = templates[nextIndex].questionText;

      const assistantMessage: Message = {
        role: "assistant",
        content: nextQuestion,
        timestamp: new Date().toISOString(),
      };

      updatedMessages.push(assistantMessage);

      await db
        .update(aiConversations)
        .set({ messages: updatedMessages })
        .where(eq(aiConversations.id, conversationId));
    } else {
      // All questions answered - mark as ready for content generation
      isComplete = true;

      await db
        .update(aiConversations)
        .set({ 
          messages: updatedMessages,
          status: "completed",
          completedAt: new Date()
        })
        .where(eq(aiConversations.id, conversationId));
    }

    return {
      hasMore,
      nextQuestion,
      isComplete,
    };
  }

  /**
   * Generate final content based on all conversation context
   */
  async generateContent(conversationId: string, userId: string): Promise<string> {
    if (!openai) {
      throw new Error("OpenAI API not configured");
    }

    // Load conversation
    const [conversation] = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // SECURITY: Verify ownership
    if (conversation.userId !== userId) {
      throw new Error("Unauthorized: You don't own this conversation");
    }

    // Load all user responses
    const responses = await db
      .select()
      .from(aiUserResponses)
      .where(eq(aiUserResponses.conversationId, conversationId));

    // Build comprehensive context
    const userProfile = conversation.userProfile as any;
    const contextSummary = this.buildContextSummary(userProfile, responses);

    // Generate content using GPT-4o
    const prompt = this.buildContentGenerationPrompt(
      conversation.contentType,
      contextSummary,
      responses
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert business writer specializing in ${conversation.contentType}s. Create professional, persuasive, well-structured content that is tailored to the user's specific business context and project details.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const generatedContent = completion.choices[0].message.content || "";

    // Store generated content
    await db
      .update(aiConversations)
      .set({ generatedContent })
      .where(eq(aiConversations.id, conversationId));

    return generatedContent;
  }

  /**
   * Get conversation history for review
   */
  async getConversationHistory(userId: string, contentType?: string) {
    if (contentType) {
      return await db
        .select()
        .from(aiConversations)
        .where(
          and(
            eq(aiConversations.userId, userId),
            eq(aiConversations.contentType, contentType)
          )
        )
        .orderBy(aiConversations.createdAt);
    }

    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(aiConversations.createdAt);
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private async getQuestionTemplates(
    contentType: string,
    questionLevel: "basic" | "advanced",
    projectType?: string
  ) {
    const templates = await db
      .select()
      .from(aiQuestionTemplates)
      .where(
        and(
          eq(aiQuestionTemplates.contentType, contentType),
          eq(aiQuestionTemplates.questionLevel, questionLevel),
          eq(aiQuestionTemplates.isActive, true)
        )
      )
      .orderBy(aiQuestionTemplates.orderIndex);

    // Filter by project type if advanced questions
    if (questionLevel === "advanced" && projectType) {
      return templates.filter((t) => {
        const filter = t.projectTypeFilter as string[];
        return filter.length === 0 || filter.includes(projectType);
      });
    }

    return templates;
  }

  private buildSystemPrompt(user: any, context: ConversationContext): string {
    const profile = user.city || user.state || user.businessType
      ? `The user's business is located in ${user.city}, ${user.state}. They run a ${user.businessType} (${user.entityType})`
      : "The user is building their business";

    return `You are an intelligent AI assistant helping a user create a professional ${context.contentType}.

User Context:
${profile}
${user.industry ? `Industry: ${user.industry}` : ""}
${user.targetMarket ? `Target Market: ${user.targetMarket}` : ""}

Your job is to:
1. Ask clarifying follow-up questions when answers are vague or incomplete
2. Help the user think through details they might have missed
3. Be encouraging and professional
4. Remember all previous answers in the conversation

Keep follow-up questions concise and specific. Don't ask more than one follow-up per answer.`;
  }

  private async shouldAskFollowUp(
    answer: string,
    question: string,
    userProfile: any
  ): Promise<boolean> {
    if (!openai) return false;

    // Don't ask follow-ups for very detailed answers (>100 words)
    if (answer.split(" ").length > 100) return false;

    // Use AI to determine if answer needs clarification
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are analyzing if a user's answer to a business question is complete enough or needs follow-up. Respond with ONLY 'yes' or 'no'.",
        },
        {
          role: "user",
          content: `Question: ${question}\nAnswer: ${answer}\n\nIs this answer too vague or incomplete to be useful? Does it need a clarifying follow-up question?`,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const decision = completion.choices[0].message.content?.trim().toLowerCase();
    return decision === "yes";
  }

  private async generateFollowUp(
    answer: string,
    originalQuestion: string,
    conversationHistory: Message[],
    userProfile: any
  ): Promise<string> {
    if (!openai) throw new Error("OpenAI not configured");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: this.buildSystemPrompt({ ...userProfile }, {
            userId: "",
            contentType: "proposal",
            questionLevel: "basic",
          }),
        },
        ...conversationHistory,
        {
          role: "user",
          content: `The user just answered: "${answer}" to the question: "${originalQuestion}". Ask ONE specific follow-up question to clarify or expand on their answer. Keep it concise and helpful.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0].message.content || "Can you provide more details?";
  }

  private buildContextSummary(userProfile: any, responses: any[]): string {
    let summary = "Business Context:\n";

    if (userProfile.city && userProfile.state) {
      summary += `- Location: ${userProfile.city}, ${userProfile.state}\n`;
    }
    if (userProfile.businessType) {
      summary += `- Business Type: ${userProfile.businessType}\n`;
    }
    if (userProfile.entityType) {
      summary += `- Entity Type: ${userProfile.entityType}\n`;
    }
    if (userProfile.industry) {
      summary += `- Industry: ${userProfile.industry}\n`;
    }
    if (userProfile.targetMarket) {
      summary += `- Target Market: ${userProfile.targetMarket}\n`;
    }

    summary += "\nProject Details:\n";
    responses.forEach((r, i) => {
      summary += `${i + 1}. ${r.questionText}\n   Answer: ${r.responseText}\n`;
    });

    return summary;
  }

  private buildContentGenerationPrompt(
    contentType: string,
    contextSummary: string,
    responses: any[]
  ): string {
    return `Create a professional, persuasive ${contentType} based on the following information:

${contextSummary}

Requirements:
- Use a professional, confident tone
- Structure the content with clear sections and headings
- Incorporate all the details provided above
- Make it specific to the user's business and industry
- Include concrete examples and specifics from their answers
- Make it actionable and compelling

Generate the ${contentType} content now:`;
  }
}

export const aiAssistantService = new AiAssistantService();
