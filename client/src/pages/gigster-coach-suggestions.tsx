import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Check, X, Inbox, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Suggestion = {
  id: string;
  title: string;
  reason: string | null;
  severity: "info" | "warn" | "critical";
  actionType: string;
  sourceIntent: string;
  payload: any;
  createdAt: string;
};

export default function GigsterCoachSuggestionsPage() {
  const [rows, setRows] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const r = await apiRequest<Suggestion[]>("GET", "/api/gigster-coach/suggestions?status=open&limit=100");
      setRows(r);
    } catch (e: any) {
      toast({ title: "Failed to load suggestions", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function apply(id: string, payload: any) {
    setApplying(id);
    try {
      await apiRequest("POST", `/api/gigster-coach/suggestions/${id}/apply`, {
        apply: payload,
      });
      toast({ title: "Suggestion marked as applied" });
      await load();
    } catch (e: any) {
      toast({ title: "Apply failed", description: e.message, variant: "destructive" });
    } finally {
      setApplying(null);
    }
  }

  async function dismiss(id: string) {
    try {
      await apiRequest("POST", `/api/gigster-coach/suggestions/${id}/dismiss`, {});
      toast({ title: "Suggestion dismissed" });
      await load();
    } catch (e: any) {
      toast({ title: "Dismiss failed", description: e.message, variant: "destructive" });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warn": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "warn": return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Warning</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-page-title">
            <Inbox className="h-6 w-6" />
            Coach Suggestions Inbox
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review suggestions from GigsterCoach. Apply is always user-initiated.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} data-testid="button-refresh">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      <div className="space-y-4">
        {rows.map((s) => (
          <Card key={s.id} data-testid={`card-suggestion-${s.id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(s.severity)}
                  <CardTitle className="text-base" data-testid={`text-title-${s.id}`}>
                    {s.title}
                  </CardTitle>
                </div>
                {getSeverityBadge(s.severity)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {s.reason && (
                <p className="text-sm text-muted-foreground" data-testid={`text-reason-${s.id}`}>
                  {s.reason}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{s.actionType}</Badge>
                <span>from {s.sourceIntent}</span>
                <span>•</span>
                <span>{new Date(s.createdAt).toLocaleDateString()}</span>
              </div>

              {s.payload && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View payload
                  </summary>
                  <pre className="mt-2 bg-muted rounded p-2 overflow-auto max-h-32">
                    {JSON.stringify(s.payload, null, 2)}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => apply(s.id, s.payload)}
                  disabled={applying === s.id || !s.payload}
                  data-testid={`button-apply-${s.id}`}
                >
                  {applying === s.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  {s.payload ? "Mark Applied" : "No action available"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dismiss(s.id)}
                  data-testid={`button-dismiss-${s.id}`}
                >
                  <X className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {rows.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground" data-testid="text-empty-state">
                No open suggestions. Use GigsterCoach to get personalized recommendations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
