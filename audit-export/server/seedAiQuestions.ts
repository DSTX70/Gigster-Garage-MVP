import { db } from "./db";
import { aiQuestionTemplates } from "@shared/schema";

export async function seedAiQuestions() {
  console.log("🌱 Seeding AI question templates...");

  const templates = [
    // ==================== PROPOSAL QUESTIONS ====================
    // Basic Questions (Generic for all proposals)
    {
      contentType: "proposal",
      questionLevel: "basic" as const,
      questionText: "What problem does this project solve for the client?",
      orderIndex: 1,
      projectTypeFilter: [],
      placeholder: "e.g., Our client needs a new website to increase online sales",
      helpText: "Describe the core challenge or opportunity this project addresses"
    },
    {
      contentType: "proposal",
      questionLevel: "basic",
      questionText: "What is the expected timeline for this project?",
      orderIndex: 2,
      projectTypeFilter: [],
      placeholder: "e.g., 8-12 weeks from kickoff to launch",
      helpText: "Provide realistic timeline including key milestones"
    },
    {
      contentType: "proposal",
      questionLevel: "basic",
      questionText: "What is the estimated budget range?",
      orderIndex: 3,
      projectTypeFilter: [],
      placeholder: "e.g., $25,000 - $35,000",
      helpText: "Give a realistic budget range for the project scope"
    },
    {
      contentType: "proposal",
      questionLevel: "basic",
      questionText: "Who are the key stakeholders and decision-makers?",
      orderIndex: 4,
      projectTypeFilter: [],
      placeholder: "e.g., CMO, IT Director, CEO for final approval",
      helpText: "List people who will be involved in decision-making"
    },
    {
      contentType: "proposal",
      questionLevel: "basic",
      questionText: "What are the main deliverables?",
      orderIndex: 5,
      projectTypeFilter: [],
      placeholder: "e.g., Responsive website, admin dashboard, training documentation",
      helpText: "List specific items or outcomes you'll provide"
    },
    {
      contentType: "proposal",
      questionLevel: "basic",
      questionText: "What makes your solution unique or better?",
      orderIndex: 6,
      projectTypeFilter: [],
      placeholder: "e.g., Our proprietary framework reduces development time by 40%",
      helpText: "Explain your competitive advantage or unique approach"
    },
    {
      contentType: "proposal",
      questionLevel: "basic",
      questionText: "What support or training will you provide?",
      orderIndex: 7,
      projectTypeFilter: [],
      placeholder: "e.g., 3 months of technical support, 2 training sessions",
      helpText: "Detail post-project support and training offerings"
    },
    {
      contentType: "proposal",
      questionLevel: "basic",
      questionText: "What are the payment terms?",
      orderIndex: 8,
      projectTypeFilter: [],
      placeholder: "e.g., 50% deposit, 25% at midpoint, 25% on completion",
      helpText: "Specify payment schedule and terms"
    },
    {
      contentType: "proposal",
      questionLevel: "basic",
      questionText: "What success metrics will you track?",
      orderIndex: 9,
      projectTypeFilter: [],
      placeholder: "e.g., 30% increase in online conversions, 50% faster page loads",
      helpText: "Define how success will be measured"
    },
    {
      contentType: "proposal",
      questionLevel: "basic",
      questionText: "Are there any critical assumptions or dependencies?",
      orderIndex: 10,
      projectTypeFilter: [],
      placeholder: "e.g., Client provides brand assets within 1 week of kickoff",
      helpText: "Note anything that could impact the project timeline or budget"
    },

    // Advanced Questions - Construction/Physical Projects
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "What materials are you using for this project?",
      orderIndex: 1,
      projectTypeFilter: ["construction", "manufacturing", "installation"],
      placeholder: "e.g., Steel beams, composite decking, energy-efficient windows",
      helpText: "List primary materials with quality grades or specifications"
    },
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "What specific services are you providing on this project?",
      orderIndex: 2,
      projectTypeFilter: ["construction", "renovation", "installation"],
      placeholder: "e.g., Site preparation, foundation work, framing, electrical, final inspection",
      helpText: "Break down the service components in sequential order"
    },
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "Are there any challenges, risks, or site constraints you want to flag?",
      orderIndex: 3,
      projectTypeFilter: [],
      placeholder: "e.g., Limited access for equipment, weather delays possible, requires permits",
      helpText: "Identify potential issues and your mitigation strategies"
    },
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "What permits, licenses, or regulatory approvals are required?",
      orderIndex: 4,
      projectTypeFilter: ["construction", "renovation", "environmental"],
      placeholder: "e.g., Building permit, electrical permit, environmental impact assessment",
      helpText: "List regulatory requirements and who is responsible"
    },
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "What warranty or guarantee do you offer on your work?",
      orderIndex: 5,
      projectTypeFilter: [],
      placeholder: "e.g., 1-year workmanship warranty, 10-year material warranty",
      helpText: "Detail warranty terms and what is covered"
    },

    // Advanced Questions - Marketing/Social Media
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "Who are your target customers or audience?",
      orderIndex: 6,
      projectTypeFilter: ["marketing", "advertising", "social_media", "branding"],
      placeholder: "e.g., B2B SaaS companies, $1M-$10M revenue, tech-forward CEOs",
      helpText: "Define your ideal customer profile with demographics and psychographics"
    },
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "What makes your products or services stand out from competitors?",
      orderIndex: 7,
      projectTypeFilter: ["marketing", "advertising", "social_media", "branding", "sales"],
      placeholder: "e.g., Only provider with real-time AI analytics, 24/7 US-based support",
      helpText: "Articulate your unique value proposition and differentiators"
    },
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "What marketing channels will you use and why?",
      orderIndex: 8,
      projectTypeFilter: ["marketing", "advertising", "social_media"],
      placeholder: "e.g., LinkedIn ads (B2B audience), Instagram (visual content), email nurture",
      helpText: "Specify channels and justify each with audience fit"
    },
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "What's the customer journey you're targeting?",
      orderIndex: 9,
      projectTypeFilter: ["marketing", "sales", "customer_experience"],
      placeholder: "e.g., Awareness (blog) → Consideration (webinar) → Decision (demo + trial)",
      helpText: "Map out the stages from awareness to purchase"
    },
    {
      contentType: "proposal",
      questionLevel: "advanced",
      questionText: "What are your competitors doing that works (or doesn't work)?",
      orderIndex: 10,
      projectTypeFilter: ["marketing", "strategy", "competitive_analysis"],
      placeholder: "e.g., Competitor A has strong SEO but weak social presence",
      helpText: "Share competitive intelligence to inform strategy"
    },

    // ==================== CONTRACT QUESTIONS ====================
    // Basic Questions
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "What is the scope of work covered by this contract?",
      orderIndex: 1,
      projectTypeFilter: [],
      placeholder: "e.g., Development of mobile app including iOS and Android versions",
      helpText: "Clearly define what work is included and excluded"
    },
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "What is the contract term and start date?",
      orderIndex: 2,
      projectTypeFilter: [],
      placeholder: "e.g., 6 months starting January 15, 2025",
      helpText: "Specify duration and when work begins"
    },
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "What are the payment terms and amounts?",
      orderIndex: 3,
      projectTypeFilter: [],
      placeholder: "e.g., $10,000/month, net 30, first payment on contract signing",
      helpText: "Detail payment schedule, amounts, and terms"
    },
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "Who owns the intellectual property created?",
      orderIndex: 4,
      projectTypeFilter: [],
      placeholder: "e.g., Client owns all IP upon final payment",
      helpText: "Clarify IP ownership and any licensing terms"
    },
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "What are the termination terms?",
      orderIndex: 5,
      projectTypeFilter: [],
      placeholder: "e.g., Either party can terminate with 30 days written notice",
      helpText: "Specify how and when the contract can be ended"
    },
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "What confidentiality or NDA terms apply?",
      orderIndex: 6,
      projectTypeFilter: [],
      placeholder: "e.g., Both parties agree to 2-year confidentiality period",
      helpText: "Detail confidentiality obligations and duration"
    },
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "What are the client's responsibilities?",
      orderIndex: 7,
      projectTypeFilter: [],
      placeholder: "e.g., Provide timely feedback, access to systems, approve deliverables",
      helpText: "List what the client must provide or do"
    },
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "What happens if deadlines are missed?",
      orderIndex: 8,
      projectTypeFilter: [],
      placeholder: "e.g., No penalty if delay is client-caused; refund if contractor misses deadline",
      helpText: "Define consequences for timeline issues"
    },
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "What are the change order procedures?",
      orderIndex: 9,
      projectTypeFilter: [],
      placeholder: "e.g., Written change orders required, priced at hourly rate + 10%",
      helpText: "Explain how scope changes are handled"
    },
    {
      contentType: "contract",
      questionLevel: "basic",
      questionText: "What warranties or guarantees are included?",
      orderIndex: 10,
      projectTypeFilter: [],
      placeholder: "e.g., 90-day bug fix guarantee, code quality warranty",
      helpText: "Detail any warranties on work performed"
    },

    // Advanced Questions - Contracts
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "What are the specific deliverables and acceptance criteria?",
      orderIndex: 1,
      projectTypeFilter: [],
      placeholder: "e.g., Working app with <2s load time, 99% uptime, passes security audit",
      helpText: "Define measurable acceptance criteria for each deliverable"
    },
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "What indemnification clauses should be included?",
      orderIndex: 2,
      projectTypeFilter: [],
      placeholder: "e.g., Client indemnifies against IP claims on provided content",
      helpText: "Specify who is protected from what types of claims"
    },
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "What are the liability limitations?",
      orderIndex: 3,
      projectTypeFilter: [],
      placeholder: "e.g., Liability capped at total contract value or $50,000, whichever is less",
      helpText: "Define maximum liability exposure for both parties"
    },
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "What dispute resolution process applies?",
      orderIndex: 4,
      projectTypeFilter: [],
      placeholder: "e.g., Mediation first, then arbitration in [state], no class actions",
      helpText: "Outline steps for resolving disagreements"
    },
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "Are there any exclusivity or non-compete clauses?",
      orderIndex: 5,
      projectTypeFilter: [],
      placeholder: "e.g., Contractor can work for competitors but not disclose confidential info",
      helpText: "Define any restrictions on working with competitors"
    },
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "What insurance coverage is required?",
      orderIndex: 6,
      projectTypeFilter: ["construction", "professional_services"],
      placeholder: "e.g., $2M general liability, $1M E&O coverage",
      helpText: "Specify required insurance types and coverage amounts"
    },
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "What are the force majeure provisions?",
      orderIndex: 7,
      projectTypeFilter: [],
      placeholder: "e.g., Performance suspended during natural disasters, pandemics, acts of war",
      helpText: "Define events that excuse non-performance"
    },
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "Are there renewal or extension options?",
      orderIndex: 8,
      projectTypeFilter: [],
      placeholder: "e.g., Auto-renew for 1 year unless 60 days notice given",
      helpText: "Specify renewal terms and conditions"
    },
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "What audit or inspection rights exist?",
      orderIndex: 9,
      projectTypeFilter: [],
      placeholder: "e.g., Client may audit project records with 5 days notice",
      helpText: "Define rights to review work, records, or processes"
    },
    {
      contentType: "contract",
      questionLevel: "advanced",
      questionText: "What happens to work in progress if contract is terminated?",
      orderIndex: 10,
      projectTypeFilter: [],
      placeholder: "e.g., Client receives all work to date, pays for completed milestones",
      helpText: "Clarify treatment of partial work upon termination"
    }
  ];

  try {
    // Delete existing templates to avoid duplicates
    await db.delete(aiQuestionTemplates);
    
    // Insert new templates
    await db.insert(aiQuestionTemplates).values(templates);
    
    console.log(`✅ Seeded ${templates.length} AI question templates`);
  } catch (error) {
    console.error("❌ Error seeding AI questions:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAiQuestions()
    .then(() => {
      console.log("✅ Seed completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}
