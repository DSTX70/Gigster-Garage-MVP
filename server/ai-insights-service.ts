import OpenAI from 'openai';
import { storage } from './storage';

/**
 * AI-Powered Insights Service
 * Provides intelligent analytics and recommendations using GPT-4
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface InsightData {
  tasks: any[];
  projects: any[];
  timeLog: any[];
  invoices: any[];
  proposals: any[];
  contracts: any[];
}

export interface AIInsight {
  id: string;
  type: 'productivity' | 'financial' | 'project' | 'workflow' | 'opportunity';
  title: string;
  description: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  actionItems: string[];
  confidence: number;
  createdAt: Date;
}

export class AIInsightsService {
  
  /**
   * Generate comprehensive business insights
   */
  async generateInsights(userId: string): Promise<AIInsight[]> {
    try {
      console.log('🧠 Generating AI insights for user:', userId);
      
      // Gather user data
      const insightData = await this.gatherUserData(userId);
      
      // Generate insights using AI
      const insights = await Promise.all([
        this.analyzeProductivity(insightData),
        this.analyzeFinancialHealth(insightData),
        this.analyzeProjectProgress(insightData),
        this.identifyWorkflowOptimizations(insightData),
        this.identifyBusinessOpportunities(insightData)
      ]);

      const allInsights = insights.flat().filter(insight => insight !== null);
      
      console.log(`✅ Generated ${allInsights.length} AI insights`);
      return allInsights;
    } catch (error) {
      console.error('❌ Error generating AI insights:', error);
      throw error;
    }
  }

  /**
   * Gather comprehensive user data for analysis
   */
  private async gatherUserData(userId: string): Promise<InsightData> {
    const [tasks, projects, timeLog, invoices, proposals, contracts] = await Promise.all([
      storage.getTasks().then(tasks => tasks.filter(t => t.assignedToId === userId || t.createdById === userId)),
      storage.getProjects(),
      storage.getTimeLogs().then(logs => logs.filter(log => log.userId === userId)),
      storage.getInvoices(),
      storage.getProposals(),
      storage.getContracts()
    ]);

    return { tasks, projects, timeLog, invoices, proposals, contracts };
  }

  /**
   * Analyze user productivity patterns
   */
  private async analyzeProductivity(data: InsightData): Promise<AIInsight | null> {
    try {
      const completedTasks = data.tasks.filter(t => t.status === 'completed');
      const overdueTasks = data.tasks.filter(t => t.status === 'overdue');
      const totalTimeLogged = data.timeLog.reduce((sum, log) => sum + (log.duration || 0), 0);

      const prompt = `
        Analyze this user's productivity data and provide insights:
        
        Task Completion:
        - Total tasks: ${data.tasks.length}
        - Completed tasks: ${completedTasks.length}
        - Overdue tasks: ${overdueTasks.length}
        - Completion rate: ${data.tasks.length > 0 ? (completedTasks.length / data.tasks.length * 100).toFixed(1) : 0}%
        
        Time Tracking:
        - Total time logged: ${totalTimeLogged} minutes
        - Average time per task: ${completedTasks.length > 0 ? (totalTimeLogged / completedTasks.length).toFixed(1) : 0} minutes
        
        Respond with JSON in this exact format:
        {
          "title": "Brief insight title",
          "description": "2-3 sentence analysis of productivity patterns",
          "recommendation": "Specific actionable recommendation",
          "priority": "high|medium|low",
          "impact": "Expected impact of following recommendation",
          "actionItems": ["action1", "action2", "action3"],
          "confidence": 0.85
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const insight = JSON.parse(response.choices[0].message.content!);
      
      return {
        id: `productivity_${Date.now()}`,
        type: 'productivity',
        ...insight,
        createdAt: new Date()
      };
    } catch (error) {
      console.warn('⚠️ Failed to analyze productivity:', error);
      return null;
    }
  }

  /**
   * Analyze financial health and revenue patterns
   */
  private async analyzeFinancialHealth(data: InsightData): Promise<AIInsight | null> {
    try {
      const totalInvoiceValue = data.invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const paidInvoices = data.invoices.filter(inv => inv.status === 'paid');
      const overdueInvoices = data.invoices.filter(inv => inv.status === 'overdue');
      const proposalValue = data.proposals.reduce((sum, prop) => sum + (prop.totalBudget || 0), 0);

      const prompt = `
        Analyze this business's financial health:
        
        Revenue Metrics:
        - Total invoice value: $${totalInvoiceValue}
        - Paid invoices: ${paidInvoices.length} ($${paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)})
        - Overdue invoices: ${overdueInvoices.length} ($${overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)})
        - Pipeline value (proposals): $${proposalValue}
        - Payment collection rate: ${data.invoices.length > 0 ? (paidInvoices.length / data.invoices.length * 100).toFixed(1) : 0}%
        
        Respond with JSON financial insights and recommendations.
        {
          "title": "Financial health insight title",
          "description": "Financial performance analysis",
          "recommendation": "Specific financial improvement recommendation",
          "priority": "high|medium|low",
          "impact": "Expected financial impact",
          "actionItems": ["financial action1", "financial action2"],
          "confidence": 0.8
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const insight = JSON.parse(response.choices[0].message.content!);
      
      return {
        id: `financial_${Date.now()}`,
        type: 'financial',
        ...insight,
        createdAt: new Date()
      };
    } catch (error) {
      console.warn('⚠️ Failed to analyze financial health:', error);
      return null;
    }
  }

  /**
   * Analyze project progress and delivery patterns
   */
  private async analyzeProjectProgress(data: InsightData): Promise<AIInsight | null> {
    try {
      const activeProjects = data.projects.filter(p => p.status === 'active');
      const completedProjects = data.projects.filter(p => p.status === 'completed');
      
      const projectTaskCounts = data.projects.map(project => ({
        name: project.name,
        totalTasks: data.tasks.filter(t => t.projectId === project.id).length,
        completedTasks: data.tasks.filter(t => t.projectId === project.id && t.status === 'completed').length
      }));

      const prompt = `
        Analyze project delivery performance:
        
        Project Portfolio:
        - Active projects: ${activeProjects.length}
        - Completed projects: ${completedProjects.length}
        - Project completion rate: ${data.projects.length > 0 ? (completedProjects.length / data.projects.length * 100).toFixed(1) : 0}%
        
        Project Details:
        ${projectTaskCounts.map(p => `- ${p.name}: ${p.completedTasks}/${p.totalTasks} tasks completed`).join('\n')}
        
        Provide project management insights and recommendations.
        {
          "title": "Project delivery insight",
          "description": "Project progress and delivery analysis", 
          "recommendation": "Project management improvement recommendation",
          "priority": "high|medium|low",
          "impact": "Expected project delivery impact",
          "actionItems": ["project action1", "project action2"],
          "confidence": 0.9
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const insight = JSON.parse(response.choices[0].message.content!);
      
      return {
        id: `project_${Date.now()}`,
        type: 'project',
        ...insight,
        createdAt: new Date()
      };
    } catch (error) {
      console.warn('⚠️ Failed to analyze project progress:', error);
      return null;
    }
  }

  /**
   * Identify workflow optimization opportunities
   */
  private async identifyWorkflowOptimizations(data: InsightData): Promise<AIInsight | null> {
    try {
      const tasksByPriority = {
        high: data.tasks.filter(t => t.priority === 'high').length,
        medium: data.tasks.filter(t => t.priority === 'medium').length,
        low: data.tasks.filter(t => t.priority === 'low').length
      };

      const averageTaskDuration = data.timeLog.length > 0 
        ? data.timeLog.reduce((sum, log) => sum + (log.duration || 0), 0) / data.timeLog.length 
        : 0;

      const prompt = `
        Analyze workflow efficiency:
        
        Task Distribution:
        - High priority: ${tasksByPriority.high}
        - Medium priority: ${tasksByPriority.medium}  
        - Low priority: ${tasksByPriority.low}
        - Average task duration: ${averageTaskDuration.toFixed(1)} minutes
        
        Time Tracking Patterns:
        - Total time entries: ${data.timeLog.length}
        - Productivity sessions: ${data.timeLog.filter(log => (log.duration || 0) > 30).length}
        
        Identify workflow optimization opportunities.
        {
          "title": "Workflow optimization opportunity",
          "description": "Workflow efficiency analysis",
          "recommendation": "Specific workflow improvement recommendation", 
          "priority": "high|medium|low",
          "impact": "Expected workflow improvement impact",
          "actionItems": ["workflow action1", "workflow action2"],
          "confidence": 0.75
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const insight = JSON.parse(response.choices[0].message.content!);
      
      return {
        id: `workflow_${Date.now()}`,
        type: 'workflow',
        ...insight,
        createdAt: new Date()
      };
    } catch (error) {
      console.warn('⚠️ Failed to analyze workflow optimization:', error);
      return null;
    }
  }

  /**
   * Identify business growth opportunities
   */
  private async identifyBusinessOpportunities(data: InsightData): Promise<AIInsight | null> {
    try {
      const acceptedProposals = data.proposals.filter(p => p.status === 'accepted');
      const proposalWinRate = data.proposals.length > 0 
        ? (acceptedProposals.length / data.proposals.length * 100).toFixed(1)
        : '0';

      const contractValue = data.contracts.reduce((sum, contract) => 
        sum + parseFloat(contract.contractValue || '0'), 0);

      const prompt = `
        Identify business growth opportunities:
        
        Sales Performance:
        - Total proposals: ${data.proposals.length}
        - Accepted proposals: ${acceptedProposals.length}
        - Proposal win rate: ${proposalWinRate}%
        - Total contract value: $${contractValue}
        
        Client Relationships:
        - Active contracts: ${data.contracts.filter(c => c.status === 'active').length}
        - Recurring revenue: ${data.contracts.filter(c => c.contractType === 'recurring').length} contracts
        
        Identify specific business growth opportunities.
        {
          "title": "Business growth opportunity",
          "description": "Growth potential analysis",
          "recommendation": "Specific growth strategy recommendation",
          "priority": "high|medium|low", 
          "impact": "Expected business growth impact",
          "actionItems": ["growth action1", "growth action2"],
          "confidence": 0.8
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const insight = JSON.parse(response.choices[0].message.content!);
      
      return {
        id: `opportunity_${Date.now()}`,
        type: 'opportunity',
        ...insight,
        createdAt: new Date()
      };
    } catch (error) {
      console.warn('⚠️ Failed to identify business opportunities:', error);
      return null;
    }
  }

  /**
   * Generate personalized task recommendations
   */
  async generateTaskRecommendations(userId: string): Promise<string[]> {
    try {
      const data = await this.gatherUserData(userId);
      
      const prompt = `
        Based on this user's current workload, suggest 3-5 specific actionable tasks:
        
        Current Status:
        - Active tasks: ${data.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length}
        - Overdue items: ${data.tasks.filter(t => t.status === 'overdue').length}
        - Recent proposals: ${data.proposals.filter(p => p.status === 'sent').length}
        - Outstanding invoices: ${data.invoices.filter(i => i.status === 'sent').length}
        
        Respond with JSON array of recommended tasks:
        ["task 1", "task 2", "task 3", "task 4", "task 5"]
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.8
      });

      const recommendations = JSON.parse(response.choices[0].message.content!);
      return recommendations.tasks || [];
    } catch (error) {
      console.warn('⚠️ Failed to generate task recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze team performance (for admin users)
   */
  async generateTeamInsights(): Promise<AIInsight[]> {
    try {
      console.log('🧠 Generating team performance insights');
      
      const [allTasks, allUsers, allTimeLog] = await Promise.all([
        storage.getTasks(),
        storage.getUsers(),
        storage.getTimeLogs()
      ]);

      const teamMetrics = allUsers.map(user => {
        const userTasks = allTasks.filter(t => t.assignedToId === user.id);
        const userTimeLog = allTimeLog.filter(log => log.userId === user.id);
        
        return {
          name: user.name,
          tasksCompleted: userTasks.filter(t => t.status === 'completed').length,
          tasksTotal: userTasks.length,
          timeLogged: userTimeLog.reduce((sum, log) => sum + (log.duration || 0), 0)
        };
      });

      const prompt = `
        Analyze team performance data:
        
        Team Members:
        ${teamMetrics.map(member => 
          `- ${member.name}: ${member.tasksCompleted}/${member.tasksTotal} tasks, ${member.timeLogged} min logged`
        ).join('\n')}
        
        Provide team performance insights and management recommendations.
        {
          "title": "Team performance insight",
          "description": "Team productivity and collaboration analysis",
          "recommendation": "Team management recommendation",
          "priority": "medium",
          "impact": "Expected team performance impact", 
          "actionItems": ["team action1", "team action2"],
          "confidence": 0.85
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const insight = JSON.parse(response.choices[0].message.content!);
      
      return [{
        id: `team_${Date.now()}`,
        type: 'productivity',
        ...insight,
        createdAt: new Date()
      }];
    } catch (error) {
      console.error('❌ Failed to generate team insights:', error);
      return [];
    }
  }
}

export const aiInsightsService = new AIInsightsService();