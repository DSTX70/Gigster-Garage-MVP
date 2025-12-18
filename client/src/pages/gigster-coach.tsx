import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, FileText, CheckCircle2, Lightbulb, History, Send } from "lucide-react";

type CoachResponse = {
  answer: string;
  suggestions?: any[];
  checklist?: any[];
  interactionId?: string;
  model?: string;
  tokensUsed?: number;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  intent: string;
  question: string;
  answer: string;
  model?: string;
  tokensUsed?: number;
};

export default function GigsterCoachPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<CoachResponse | null>(null);
  const [activeTab, setActiveTab] = useState("ask");

  const { data: history, isLoading: historyLoading } = useQuery<HistoryItem[]>({
    queryKey: ["/api/gigster-coach/history"],
    enabled: isAuthenticated,
  });

  const askMutation = useMutation({
    mutationFn: async (data: { question: string }) => {
      const res = await apiRequest("/api/gigster-coach/ask", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res as CoachResponse;
    },
    onSuccess: (data) => {
      setResponse(data);
      queryClient.invalidateQueries({ queryKey: ["/api/gigster-coach/history"] });
      toast({ title: "Response received", description: "GigsterCoach has answered your question." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to get response", variant: "destructive" });
    },
  });

  const draftMutation = useMutation({
    mutationFn: async (data: { question: string; draftTarget?: string }) => {
      const res = await apiRequest("/api/gigster-coach/draft", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res as CoachResponse;
    },
    onSuccess: (data) => {
      setResponse(data);
      queryClient.invalidateQueries({ queryKey: ["/api/gigster-coach/history"] });
      toast({ title: "Draft generated", description: "GigsterCoach has drafted content for you." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to generate draft", variant: "destructive" });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: { question: string; artifactText?: string }) => {
      const res = await apiRequest("/api/gigster-coach/review", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res as CoachResponse;
    },
    onSuccess: (data) => {
      setResponse(data);
      queryClient.invalidateQueries({ queryKey: ["/api/gigster-coach/history"] });
      toast({ title: "Review complete", description: "GigsterCoach has reviewed your content." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to review", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!question.trim()) return;
    
    if (activeTab === "ask") {
      askMutation.mutate({ question });
    } else if (activeTab === "draft") {
      draftMutation.mutate({ question });
    } else if (activeTab === "review") {
      reviewMutation.mutate({ question });
    }
  };

  const isLoading = askMutation.isPending || draftMutation.isPending || reviewMutation.isPending;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to use GigsterCoach.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#004C6D] flex items-center gap-3" data-testid="heading-gigster-coach">
          <Lightbulb className="h-8 w-8" />
          GigsterCoach
        </h1>
        <p className="text-muted-foreground mt-2">
          Your AI business coach - get help with proposals, invoices, contracts, and general business questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ask GigsterCoach</CardTitle>
              <CardDescription>Choose a mode and ask your question</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="ask" className="flex items-center gap-2" data-testid="tab-ask">
                    <MessageSquare className="h-4 w-4" />
                    Ask
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="flex items-center gap-2" data-testid="tab-draft">
                    <FileText className="h-4 w-4" />
                    Draft
                  </TabsTrigger>
                  <TabsTrigger value="review" className="flex items-center gap-2" data-testid="tab-review">
                    <CheckCircle2 className="h-4 w-4" />
                    Review
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ask">
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask any business question - pricing, client communication, scope management, etc.
                  </p>
                </TabsContent>
                <TabsContent value="draft">
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate drafts for proposals, invoice terms, contracts, and client messages.
                  </p>
                </TabsContent>
                <TabsContent value="review">
                  <p className="text-sm text-muted-foreground mb-4">
                    Get a review and checklist for your proposals, contracts, or invoices.
                  </p>
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    placeholder={
                      activeTab === "ask" 
                        ? "How should I handle a client who wants unlimited revisions?" 
                        : activeTab === "draft"
                        ? "Draft professional invoice payment terms for a 30-day net"
                        : "Review this proposal scope for completeness..."
                    }
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[120px] mt-2"
                    data-testid="input-question"
                  />
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || !question.trim()}
                  className="w-full bg-[#004C6D] hover:bg-[#003d59]"
                  data-testid="button-submit"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Response
                  {response.model && (
                    <Badge variant="outline" className="text-xs">
                      {response.model}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none" data-testid="text-response">
                  <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-lg">
                    {response.answer}
                  </pre>
                </div>

                {response.checklist && response.checklist.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Checklist</h4>
                    <div className="space-y-2">
                      {response.checklist.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {response.suggestions && response.suggestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Suggestions</h4>
                    <div className="space-y-2">
                      {response.suggestions.map((s: any) => (
                        <div key={s.id} className="p-3 border rounded-lg">
                          <div className="font-medium">{s.title}</div>
                          {s.reason && <p className="text-sm text-muted-foreground mt-1">{s.reason}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {response.tokensUsed && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Tokens used: {response.tokensUsed}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : history && history.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {history.slice(0, 20).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setQuestion(item.question);
                          setResponse({ answer: item.answer, model: item.model, tokensUsed: item.tokensUsed });
                        }}
                        data-testid={`history-item-${item.id}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {item.intent}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{item.question}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conversations yet. Ask your first question!
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <strong>Ask Mode:</strong> General questions about running your business
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <strong>Draft Mode:</strong> Generate professional content for documents
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <strong>Review Mode:</strong> Get feedback and checklists for your work
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
