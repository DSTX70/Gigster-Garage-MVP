import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, CheckCircle2 } from "lucide-react";
import { SuggestionApplyButton } from "@/components/gigsterCoach/SuggestionApplyButton";

type Props = {
  surface: "invoice" | "proposal" | "message" | "contract" | "other";
  contextRef?: Record<string, any>;
  structuredFields?: Record<string, any>;
  artifactText?: string;
  onInsertText?: (text: string) => void;
  draft?: Record<string, any>;
  setDraft?: (next: Record<string, any>) => void;
  onAppliedSuggestion?: (suggestionId: string) => void;
};

export function CoachSidebar(props: Props) {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"ask" | "draft" | "review">("ask");
  const [draftTarget, setDraftTarget] = useState<string>("client_message");
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResp(null);
    try {
      const base = {
        question,
        requestedAutonomy: "L0",
        contextRef: { surface: props.surface, ...(props.contextRef ?? {}) },
        structuredFields: props.structuredFields,
        artifactText: props.artifactText,
      };

      let path = "/api/gigster-coach/ask";
      let body: any = base;

      if (mode === "draft") {
        path = "/api/gigster-coach/draft";
        body = { ...base, draftTarget };
      } else if (mode === "review") {
        path = "/api/gigster-coach/review";
      }

      const r = await apiRequest("POST", path, body);
      setResp(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            GigsterCoach
          </CardTitle>
          <span className="text-xs opacity-70">{props.surface}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 text-sm" data-testid="coach-mode-buttons">
          <Button
            variant={mode === "ask" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("ask")}
            data-testid="button-mode-ask"
          >
            Ask
          </Button>
          <Button
            variant={mode === "draft" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("draft")}
            data-testid="button-mode-draft"
          >
            Draft
          </Button>
          <Button
            variant={mode === "review" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("review")}
            data-testid="button-mode-review"
          >
            Review
          </Button>
        </div>

        {mode === "draft" && (
          <Select value={draftTarget} onValueChange={setDraftTarget}>
            <SelectTrigger data-testid="select-draft-target">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client_message">Client message</SelectItem>
              <SelectItem value="invoice_terms">Invoice terms</SelectItem>
              <SelectItem value="invoice_line_items">Invoice line items</SelectItem>
              <SelectItem value="proposal_outline">Proposal outline</SelectItem>
              <SelectItem value="proposal_scope">Proposal scope</SelectItem>
              <SelectItem value="contract_terms">Contract terms</SelectItem>
              <SelectItem value="service_description">Service description</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Textarea
          className="min-h-[90px] text-sm"
          placeholder={
            mode === "ask"
              ? "How can I..."
              : mode === "draft"
                ? "What should I draft?"
                : "What should I review?"
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          data-testid="input-coach-question"
        />

        <Button
          className="w-full"
          disabled={loading || !question.trim()}
          onClick={run}
          data-testid="button-coach-run"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Working...
            </>
          ) : (
            "Run"
          )}
        </Button>

        {resp?.answer && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-sm whitespace-pre-wrap" data-testid="text-coach-answer">
              {resp.answer}
            </div>

            {Array.isArray(resp?.suggestions) && resp.suggestions.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold opacity-80">Suggestions</div>
                {resp.suggestions.map((s: any) => {
                  const applyPayload = s.applyPayload ?? s.apply_payload;
                  const canApply = Boolean(applyPayload && props.draft && props.setDraft);

                  return (
                    <div key={s.id} className="text-xs border rounded p-2 bg-muted/50">
                      <div className="font-medium">{s.title}</div>
                      {s.reason ? <div className="opacity-70">{s.reason}</div> : null}
                      <div className="mt-2 flex items-center gap-2">
                        {s.actionType === "insert_text" && s.payload?.text && props.onInsertText ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => props.onInsertText?.(String(s.payload.text))}
                            data-testid={`button-insert-${s.id}`}
                          >
                            Insert text
                          </Button>
                        ) : null}
                        {canApply && (
                          <SuggestionApplyButton
                            suggestionId={s.id}
                            payload={applyPayload}
                            draft={props.draft!}
                            setDraft={props.setDraft!}
                            onApplied={() => props.onAppliedSuggestion?.(s.id)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {Array.isArray(resp?.checklist) && resp.checklist.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold opacity-80">Checklist</div>
                <ul className="list-none text-xs space-y-1">
                  {resp.checklist.map((c: any) => (
                    <li key={c.id} className="flex items-center gap-2">
                      <CheckCircle2 className={`h-3 w-3 ${c.isComplete ? "text-green-500" : "text-muted-foreground"}`} />
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
