import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Zap, Palette, PenTool, Megaphone, BarChart3, Loader2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AgencyHub() {
  const [createPrompt, setCreatePrompt] = useState("");
  const [writePrompt, setWritePrompt] = useState("");
  const [promotePrompt, setPromotePrompt] = useState("");
  const [trackData, setTrackData] = useState("");
  const [createdContent, setCreatedContent] = useState("");
  const [writtenContent, setWrittenContent] = useState("");
  const [promoteContent, setPromoteContent] = useState("");
  const [trackInsights, setTrackInsights] = useState("");

  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/agency/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("Failed to generate content");
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedContent(data.content);
      toast({ title: "Marketing mockup created!", description: "Your creative content is ready." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create content", variant: "destructive" });
    },
  });

  const writeMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/agency/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("Failed to write content");
      return response.json();
    },
    onSuccess: (data) => {
      setWrittenContent(data.content);
      toast({ title: "Copy written!", description: "Your marketing copy is ready." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to write content", variant: "destructive" });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/agency/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("Failed to generate promotion strategy");
      return response.json();
    },
    onSuccess: (data) => {
      setPromoteContent(data.content);
      toast({ title: "Promotion strategy ready!", description: "Your advertising strategy is prepared." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate promotion strategy", variant: "destructive" });
    },
  });

  const trackMutation = useMutation({
    mutationFn: async (data: string) => {
      const response = await fetch("/api/agency/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) throw new Error("Failed to analyze data");
      return response.json();
    },
    onSuccess: (data) => {
      setTrackInsights(data.insights);
      toast({ title: "Analysis complete!", description: "Your marketing insights are ready." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to analyze data", variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agency Hub</h1>
              <p className="text-gray-600">AI-powered marketing and creative tools for your business</p>
            </div>
          </div>
        </div>

        {/* Main Tool Sections */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="promote" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Promote
            </TabsTrigger>
            <TabsTrigger value="track" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Track
            </TabsTrigger>
          </TabsList>

          {/* CREATE TAB */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-600" />
                    Create Marketing Mockups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Describe your marketing concept
                    </label>
                    <Textarea
                      placeholder="e.g., Create a social media post for a luxury watch brand targeting young professionals..."
                      value={createPrompt}
                      onChange={(e) => setCreatePrompt(e.target.value)}
                      className="min-h-[120px]"
                      data-testid="textarea-create-prompt"
                    />
                  </div>
                  <Button 
                    onClick={() => createMutation.mutate(createPrompt)}
                    disabled={!createPrompt.trim() || createMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    data-testid="button-create-generate"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Palette className="h-4 w-4 mr-2" />
                        Generate Mockup
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {createdContent ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm">{createdContent}</pre>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(createdContent)}
                        className="w-full"
                        data-testid="button-copy-created"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Content
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Palette className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Your generated mockup will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* WRITE TAB */}
          <TabsContent value="write">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-blue-600" />
                    Write Creative Copy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      What do you need written?
                    </label>
                    <Textarea
                      placeholder="e.g., Write a press release for our new product launch, targeting tech journalists..."
                      value={writePrompt}
                      onChange={(e) => setWritePrompt(e.target.value)}
                      className="min-h-[120px]"
                      data-testid="textarea-write-prompt"
                    />
                  </div>
                  <Button 
                    onClick={() => writeMutation.mutate(writePrompt)}
                    disabled={!writePrompt.trim() || writeMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-write-generate"
                  >
                    {writeMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Writing...
                      </>
                    ) : (
                      <>
                        <PenTool className="h-4 w-4 mr-2" />
                        Generate Copy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Copy</CardTitle>
                </CardHeader>
                <CardContent>
                  {writtenContent ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm">{writtenContent}</pre>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(writtenContent)}
                        className="w-full"
                        data-testid="button-copy-written"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Content
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <PenTool className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Your generated copy will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PROMOTE TAB */}
          <TabsContent value="promote">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-orange-600" />
                    Advertising Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Describe your promotion goals
                    </label>
                    <Textarea
                      placeholder="e.g., Help me create an advertising strategy for a $10k budget to promote our SaaS product to small businesses..."
                      value={promotePrompt}
                      onChange={(e) => setPromotePrompt(e.target.value)}
                      className="min-h-[120px]"
                      data-testid="textarea-promote-prompt"
                    />
                  </div>
                  <Button 
                    onClick={() => promoteMutation.mutate(promotePrompt)}
                    disabled={!promotePrompt.trim() || promoteMutation.isPending}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    data-testid="button-promote-generate"
                  >
                    {promoteMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Strategizing...
                      </>
                    ) : (
                      <>
                        <Megaphone className="h-4 w-4 mr-2" />
                        Generate Strategy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promotion Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  {promoteContent ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm">{promoteContent}</pre>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(promoteContent)}
                        className="w-full"
                        data-testid="button-copy-promote"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Strategy
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Megaphone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Your promotion strategy will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TRACK TAB */}
          <TabsContent value="track">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Marketing Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Paste your marketing data or describe what you want to track
                    </label>
                    <Textarea
                      placeholder="e.g., Analyze my campaign data: 10,000 impressions, 250 clicks, 15 conversions, $500 spent... or describe what metrics you want to track"
                      value={trackData}
                      onChange={(e) => setTrackData(e.target.value)}
                      className="min-h-[120px]"
                      data-testid="textarea-track-data"
                    />
                  </div>
                  <Button 
                    onClick={() => trackMutation.mutate(trackData)}
                    disabled={!trackData.trim() || trackMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                    data-testid="button-track-analyze"
                  >
                    {trackMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze Data
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Marketing Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  {trackInsights ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm">{trackInsights}</pre>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(trackInsights)}
                        className="w-full"
                        data-testid="button-copy-insights"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Insights
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Your marketing insights will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}