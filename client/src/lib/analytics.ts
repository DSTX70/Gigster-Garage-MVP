type EventName =
  | "signup_complete"
  | "onboarding_step_complete"
  | "invoice_created"
  | "invoice_sent"
  | "proposal_created"
  | "proposal_sent"
  | "contract_created"
  | "contract_signed"
  | "payment_succeeded"
  | "payment_failed"
  | "client_created"
  | "coach_suggestion_applied"
  | "coach_question_asked"
  | "template_used"
  | "document_downloaded"
  | "timer_started"
  | "timer_stopped"
  | "page_view"
  | "feature_used";

interface EventMetadata {
  plan?: string;
  role?: string;
  entityType?: string;
  entityId?: string;
  demoMode?: boolean;
  source?: string;
  value?: number;
  [key: string]: unknown;
}

interface AnalyticsEvent {
  name: EventName;
  timestamp: string;
  sessionId: string;
  userId?: string;
  metadata: EventMetadata;
}

let sessionId: string | null = null;
let userId: string | null = null;
let isDemo = false;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    try {
      sessionStorage.setItem("analytics_session_id", sessionId);
    } catch {
      // sessionStorage not available
    }
  }
  return sessionId;
}

export function initAnalytics(options?: {
  userId?: string;
  isDemo?: boolean;
}): void {
  if (options?.userId) {
    userId = options.userId;
  }
  if (options?.isDemo !== undefined) {
    isDemo = options.isDemo;
  }

  try {
    const storedSessionId = sessionStorage.getItem("analytics_session_id");
    if (storedSessionId) {
      sessionId = storedSessionId;
    }
  } catch {
    // sessionStorage not available
  }
}

export function setUserId(id: string | null): void {
  userId = id;
}

export function setDemoMode(demo: boolean): void {
  isDemo = demo;
}

function sendEvent(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event.name, event.metadata);
  }

  // Future: send to analytics provider
  // fetch('/api/analytics/event', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event),
  // });
}

export function track(name: EventName, metadata: EventMetadata = {}): void {
  const event: AnalyticsEvent = {
    name,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    userId: userId || undefined,
    metadata: {
      ...metadata,
      demoMode: isDemo,
    },
  };

  sendEvent(event);
}

export function trackSignupComplete(plan: string): void {
  track("signup_complete", { plan });
}

export function trackOnboardingStep(step: number, stepName: string): void {
  track("onboarding_step_complete", { 
    step: step.toString(),
    stepName,
  });
}

export function trackInvoiceCreated(invoiceId: string, value?: number): void {
  track("invoice_created", { 
    entityType: "invoice",
    entityId: invoiceId,
    value,
  });
}

export function trackInvoiceSent(invoiceId: string, value?: number): void {
  track("invoice_sent", { 
    entityType: "invoice",
    entityId: invoiceId,
    value,
  });
}

export function trackProposalCreated(proposalId: string): void {
  track("proposal_created", { 
    entityType: "proposal",
    entityId: proposalId,
  });
}

export function trackProposalSent(proposalId: string): void {
  track("proposal_sent", { 
    entityType: "proposal",
    entityId: proposalId,
  });
}

export function trackContractCreated(contractId: string): void {
  track("contract_created", { 
    entityType: "contract",
    entityId: contractId,
  });
}

export function trackContractSigned(contractId: string): void {
  track("contract_signed", { 
    entityType: "contract",
    entityId: contractId,
  });
}

export function trackPaymentSucceeded(invoiceId: string, amount: number): void {
  track("payment_succeeded", { 
    entityType: "invoice",
    entityId: invoiceId,
    value: amount,
  });
}

export function trackPaymentFailed(invoiceId: string, reason?: string): void {
  track("payment_failed", { 
    entityType: "invoice",
    entityId: invoiceId,
    source: reason,
  });
}

export function trackClientCreated(clientId: string): void {
  track("client_created", { 
    entityType: "client",
    entityId: clientId,
  });
}

export function trackCoachSuggestionApplied(suggestionId: string, action: string): void {
  track("coach_suggestion_applied", { 
    entityType: "suggestion",
    entityId: suggestionId,
    source: action,
  });
}

export function trackCoachQuestionAsked(mode: string): void {
  track("coach_question_asked", { 
    source: mode,
  });
}

export function trackTemplateUsed(templateId: string, templateType: string): void {
  track("template_used", { 
    entityType: templateType,
    entityId: templateId,
  });
}

export function trackDocumentDownloaded(documentType: string, documentId: string): void {
  track("document_downloaded", { 
    entityType: documentType,
    entityId: documentId,
  });
}

export function trackTimerStarted(projectId?: string): void {
  track("timer_started", { 
    entityType: "project",
    entityId: projectId,
  });
}

export function trackTimerStopped(duration: number, projectId?: string): void {
  track("timer_stopped", { 
    entityType: "project",
    entityId: projectId,
    value: duration,
  });
}

export function trackPageView(path: string): void {
  track("page_view", { 
    source: path,
  });
}

export function trackFeatureUsed(featureName: string, context?: string): void {
  track("feature_used", { 
    source: featureName,
    entityType: context,
  });
}

export default {
  init: initAnalytics,
  setUserId,
  setDemoMode,
  track,
  trackSignupComplete,
  trackOnboardingStep,
  trackInvoiceCreated,
  trackInvoiceSent,
  trackProposalCreated,
  trackProposalSent,
  trackContractCreated,
  trackContractSigned,
  trackPaymentSucceeded,
  trackPaymentFailed,
  trackClientCreated,
  trackCoachSuggestionApplied,
  trackCoachQuestionAsked,
  trackTemplateUsed,
  trackDocumentDownloaded,
  trackTimerStarted,
  trackTimerStopped,
  trackPageView,
  trackFeatureUsed,
};
