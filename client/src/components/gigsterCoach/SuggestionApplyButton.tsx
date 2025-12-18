import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { applyPayloadToDraft, type ApplyPayload } from "@/lib/applyEngine";
import { useToast } from "@/hooks/use-toast";

interface Props {
  suggestionId: string;
  payload: ApplyPayload | null;
  draft: Record<string, any>;
  setDraft: (next: Record<string, any>) => void;
  onApplied?: () => void;
  confirmReplace?: boolean;
}

export function SuggestionApplyButton({
  suggestionId,
  payload,
  draft,
  setDraft,
  onApplied,
  confirmReplace = false,
}: Props) {
  const [status, setStatus] = useState<"idle" | "applying" | "applied" | "error">("idle");
  const { toast } = useToast();

  if (!payload) {
    return (
      <Button variant="outline" size="sm" disabled data-testid={`button-apply-disabled-${suggestionId}`}>
        No action
      </Button>
    );
  }

  async function handleApply() {
    setStatus("applying");
    try {
      // 1. Apply locally first (optimistic)
      const updated = applyPayloadToDraft({ ...draft }, payload!, { confirmReplace });
      setDraft(updated);

      // 2. Tell server we applied (validates payload match + records)
      await apiRequest("POST", `/api/gigster-coach/suggestions/${suggestionId}/apply`, {
        apply: payload,
      });

      setStatus("applied");
      toast({ title: "Applied successfully" });
      onApplied?.();
    } catch (e: any) {
      setStatus("error");
      toast({
        title: "Apply failed",
        description: e.message || "Could not apply suggestion",
        variant: "destructive",
      });
    }
  }

  if (status === "applied") {
    return (
      <Button variant="outline" size="sm" disabled className="text-green-600" data-testid={`button-applied-${suggestionId}`}>
        <Check className="h-4 w-4 mr-1" />
        Applied
      </Button>
    );
  }

  if (status === "error") {
    return (
      <Button variant="outline" size="sm" onClick={handleApply} className="text-red-600" data-testid={`button-retry-${suggestionId}`}>
        <AlertCircle className="h-4 w-4 mr-1" />
        Retry
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleApply}
      disabled={status === "applying"}
      data-testid={`button-apply-${suggestionId}`}
    >
      {status === "applying" ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Applying...
        </>
      ) : (
        "Apply"
      )}
    </Button>
  );
}
