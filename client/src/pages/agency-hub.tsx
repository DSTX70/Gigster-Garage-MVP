import { useTranslation } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Zap, Palette, PenTool, Megaphone, BarChart3, Loader2, Copy, Download, ArrowLeft, X, Save, History, Trash2, Upload, FileText, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { SaveOptionsDialog } from "@/components/SaveOptionsDialog";

interface SavedItem {
  id: string;
  content: string;
  type: 'marketing' | 'visual' | 'promote' | 'track' | 'write';
  createdAt: string;
  metadata?: { prompt?: string; visualStyle?: string; };
}

interface SavedItemAPI {
  id: string;
  content: string;
  type: 'marketing' | 'visual' | 'promote' | 'track' | 'write';
  created_at: string;
  metadata?: { prompt?: string; visualStyle?: string; };
}

const mapSavedItem = (item: SavedItemAPI): SavedItem => ({
  id: item.id,
  content: item.content,
  type: item.type,
  createdAt: item.created_at,
  metadata: item.metadata,
});

const VISUAL_STYLES = [
  "Anime",
  "Cartoon",
  "Cyberpunk",
  "Dystopian",
  "Fantasy Worlds",
  "Line Art",
  "Minimalism",
  "Photorealistic",
  "Pixel Art",
  "Pop-Art",
  "Sci-Fi",
  "Steampunk",
  "Tropical",
  "Vintage/Retro"
];

export default function AgencyHub() {
  const { t, language } = useTranslation();
  const [createPrompt, setCreatePrompt] = useState("");
  const [writePrompt, setWritePrompt] = useState("");
  const [promotePrompt, setPromotePrompt] = useState("");
  const [trackData, setTrackData] = useState("");
  const [createdContent, setCreatedContent] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [writtenContent, setWrittenContent] = useState("");
  const [promoteContent, setPromoteContent] = useState("");
  const [trackInsights, setTrackInsights] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  
  // Visual style dropdown
  const [visualStyle, setVisualStyle] = useState<string>("Photorealistic");
  
  // Saved items state - using React Query for persistence
  const [showSavedMarketing, setShowSavedMarketing] = useState(false);
  const [showSavedVisuals, setShowSavedVisuals] = useState(false);
  const [showSavedPromote, setShowSavedPromote] = useState(false);
  const [showSavedTrack, setShowSavedTrack] = useState(false);
  const [showSavedWrite, setShowSavedWrite] = useState(false);
  const [showFullSizeModal, setShowFullSizeModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string; content: string; type: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { toast } = useToast();
  
  // Fetch saved marketing content
  const { data: savedMarketingContent = [] } = useQuery<SavedItem[]>({
    queryKey: ['/api/agency/saved-items', { type: 'marketing' }],
    queryFn: async () => {
      const response = await fetch(`/api/agency/saved-items?type=marketing&_ts=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.status === 304) return [];
      if (!response.ok) return [];
      const data: SavedItemAPI[] = await response.json();
      return data.map(mapSavedItem);
    },
  });
  
  // Fetch saved visuals
  const { data: savedVisuals = [] } = useQuery<SavedItem[]>({
    queryKey: ['/api/agency/saved-items', { type: 'visual' }],
    queryFn: async () => {
      const response = await fetch(`/api/agency/saved-items?type=visual&_ts=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.status === 304) return [];
      if (!response.ok) return [];
      const data: SavedItemAPI[] = await response.json();
      return data.map(mapSavedItem);
    },
  });

  // Fetch saved promote content
  const { data: savedPromoteContent = [] } = useQuery<SavedItem[]>({
    queryKey: ['/api/agency/saved-items', { type: 'promote' }],
    queryFn: async () => {
      const response = await fetch(`/api/agency/saved-items?type=promote&_ts=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.status === 304) return [];
      if (!response.ok) return [];
      const data: SavedItemAPI[] = await response.json();
      return data.map(mapSavedItem);
    },
  });

  // Fetch saved track content
  const { data: savedTrackContent = [] } = useQuery<SavedItem[]>({
    queryKey: ['/api/agency/saved-items', { type: 'track' }],
    queryFn: async () => {
      const response = await fetch(`/api/agency/saved-items?type=track&_ts=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.status === 304) return [];
      if (!response.ok) return [];
      const data: SavedItemAPI[] = await response.json();
      return data.map(mapSavedItem);
    },
  });

  // Fetch saved write content
  const { data: savedWriteContent = [] } = useQuery<SavedItem[]>({
    queryKey: ['/api/agency/saved-items', { type: 'write' }],
    queryFn: async () => {
      const response = await fetch(`/api/agency/saved-items?type=write&_ts=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.status === 304) return [];
      if (!response.ok) return [];
      const data: SavedItemAPI[] = await response.json();
      return data.map(mapSavedItem);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/agency/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language }),
      });
      if (!response.ok) throw new Error("Failed to generate content");
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedContent(data.content);
      toast({ title: t('success'), description: t('createdSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const styledPrompt = `${prompt}. Style: ${visualStyle}`;
      const response = await fetch("/api/agency/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: styledPrompt, style: visualStyle, language }),
      });
      if (!response.ok) throw new Error("Failed to generate image");
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Image generation response:", data);
      const imageUrl = data.imageUrl || data.url || data.path || data?.data?.imageUrl || "";
      if (imageUrl) {
        // Add cache-busting parameter to ensure image refreshes
        const urlWithCacheBust = imageUrl.includes('?') 
          ? `${imageUrl}&_t=${Date.now()}` 
          : `${imageUrl}?_t=${Date.now()}`;
        setGeneratedImageUrl(urlWithCacheBust);
        toast({ title: t('success'), description: t('createdSuccessfully') });
      } else {
        console.error("No image URL in response:", data);
        toast({ title: t('error'), description: "No image URL returned", variant: "destructive" });
      }
    },
    onError: (error) => {
      console.error("Image generation error:", error);
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    },
  });

  // Save mutation for marketing content
  const saveMarketingMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/agency/saved-items', {
        type: 'marketing',
        content,
        metadata: { prompt: createPrompt }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agency/saved-items', { type: 'marketing' }] });
      toast({ title: t('success'), description: t('savedSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    }
  });
  
  // Save mutation for visuals
  const saveVisualMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await apiRequest('POST', '/api/agency/saved-items', {
        type: 'visual',
        content: imageUrl,
        style: visualStyle,
        metadata: { prompt: createPrompt, visualStyle }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agency/saved-items', { type: 'visual' }] });
      toast({ title: t('success'), description: t('savedSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    }
  });

  // Save mutation for promote content
  const savePromoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/agency/saved-items', {
        type: 'promote',
        content,
        metadata: { prompt: promotePrompt }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agency/saved-items', { type: 'promote' }] });
      toast({ title: t('success'), description: t('savedSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    }
  });

  // Save mutation for track content
  const saveTrackMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/agency/saved-items', {
        type: 'track',
        content,
        metadata: { prompt: trackData }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agency/saved-items', { type: 'track' }] });
      toast({ title: t('success'), description: t('savedSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    }
  });

  // Save mutation for write content
  const saveWriteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/agency/saved-items', {
        type: 'write',
        content,
        metadata: { prompt: writePrompt }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agency/saved-items', { type: 'write' }] });
      toast({ title: t('success'), description: t('savedSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    }
  });
  
  // Delete mutation
  const deleteSavedItemMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'marketing' | 'visual' | 'promote' | 'track' | 'write' }) => {
      await apiRequest('DELETE', `/api/agency/saved-items/${id}`);
      return { type };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/agency/saved-items', { type: variables.type }] });
      toast({ title: t('success'), description: t('deletedSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    }
  });

  // Save functions
  const saveMarketingContent = () => {
    if (!createdContent) return;
    saveMarketingMutation.mutate(createdContent);
  };

  const saveVisual = () => {
    if (!generatedImageUrl) return;
    saveVisualMutation.mutate(generatedImageUrl);
  };

  const deleteSavedItem = (id: string, type: 'marketing' | 'visual' | 'promote' | 'track' | 'write') => {
    deleteSavedItemMutation.mutate({ id, type });
  };

  const saveWriteContent = () => {
    if (!writtenContent) return;
    saveWriteMutation.mutate(writtenContent);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          content: content,
          type: file.type || 'text/plain'
        }]);
        toast({ title: "File uploaded", description: `${file.name} ready for analysis` });
      };
      reader.onerror = () => {
        toast({ title: "Upload failed", description: `Could not read ${file.name}`, variant: "destructive" });
      };
      reader.readAsText(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getAnalysisData = () => {
    let data = trackData;
    if (uploadedFiles.length > 0) {
      const fileData = uploadedFiles.map(f => `\n--- File: ${f.name} ---\n${f.content}`).join('\n');
      data = data + fileData;
    }
    return data;
  };

  const savePromoteContent = () => {
    if (!promoteContent) return;
    savePromoteMutation.mutate(promoteContent);
  };

  const saveTrackContent = () => {
    if (!trackInsights) return;
    saveTrackMutation.mutate(trackInsights);
  };

  // AI Write function for generating marketing concept prompts
  const generateMarketingPrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "marketing_concept_prompt",
          context: "Generate a detailed marketing concept prompt that includes target audience, brand style, platform specifications, and creative direction. Make it specific and actionable for creating professional marketing mockups.",
          language
        }),
      });

      if (!response.ok) throw new Error("Failed to generate prompt");
      const data = await response.json();
      
      setCreatePrompt(data.content);
      toast({
        title: t('success'),
        description: t('createdSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorOccurred'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const writeMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/agency/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language }),
      });
      if (!response.ok) throw new Error("Failed to write content");
      return response.json();
    },
    onSuccess: (data) => {
      setWrittenContent(data.content);
      toast({ title: t('success'), description: t('createdSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/agency/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language }),
      });
      if (!response.ok) throw new Error("Failed to generate promotion strategy");
      return response.json();
    },
    onSuccess: (data) => {
      setPromoteContent(data.content);
      toast({ title: t('success'), description: t('createdSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    },
  });

  const trackMutation = useMutation({
    mutationFn: async (data: string) => {
      const response = await fetch("/api/agency/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, language }),
      });
      if (!response.ok) throw new Error("Failed to analyze data");
      return response.json();
    },
    onSuccess: (data) => {
      setTrackInsights(data.insights);
      toast({ title: t('success'), description: t('createdSuccessfully') });
    },
    onError: () => {
      toast({ title: t('error'), description: t('errorOccurred'), variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('copiedToClipboard'), description: t('copiedToClipboard') });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-back-to-dashboard">
                <ArrowLeft className="w-4 h-4" />
                {t('backToMyDashboard')}
              </Button>
            </Link>
            <div className="bg-[var(--surface)] p-3 rounded-lg border border-[color:var(--keyline)]">
              <Zap className="h-8 w-8 text-[var(--brand)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)]">{t('agencyHubTitle')}</h1>
              <p className="text-[var(--muted)]">{t('agencyHubDesc')}</p>
            </div>
          </div>
        </div>

        {/* Main Tool Sections */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t('create')}
            </TabsTrigger>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              {t('writeTab')}
            </TabsTrigger>
            <TabsTrigger value="promote" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              {t('promoteTab')}
            </TabsTrigger>
            <TabsTrigger value="track" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('trackTab')}
            </TabsTrigger>
          </TabsList>

          {/* CREATE TAB */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-600" />
                    {t('createMarketingMockups')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Describe your marketing concept
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateMarketingPrompt}
                        disabled={isGeneratingPrompt}
                        className="flex items-center gap-2"
                        data-testid="button-generate-marketing-prompt"
                      >
                        {isGeneratingPrompt ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <PenTool className="w-4 h-4" />
                        )}
                        {isGeneratingPrompt ? "Writing..." : "Write"}
                      </Button>
                    </div>
                    <Textarea
                      placeholder="e.g., Create a social media post for a luxury watch brand targeting young professionals..."
                      value={createPrompt}
                      onChange={(e) => setCreatePrompt(e.target.value)}
                      className="min-h-[120px]"
                      data-testid="textarea-create-prompt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => createMutation.mutate(createPrompt)}
                      disabled={!createPrompt.trim() || createMutation.isPending}
                      className="w-full bg-[var(--brand)] hover:opacity-90 text-white"
                      data-testid="button-create-generate"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('creatingConcept')}
                        </>
                      ) : (
                        <>
                          <Palette className="h-4 w-4 mr-2" />
                          {t('generateConcept')}
                        </>
                      )}
                    </Button>
                    
                    {/* Visual Style Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{t('visualStyle')}</label>
                      <Select value={visualStyle} onValueChange={setVisualStyle}>
                        <SelectTrigger data-testid="select-visual-style">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          {VISUAL_STYLES.map(style => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={() => generateImageMutation.mutate(createPrompt)}
                      disabled={!createPrompt.trim() || generateImageMutation.isPending}
                      variant="outline"
                      className="w-full border-[color:var(--keyline)] hover:bg-[var(--surface)]"
                      data-testid="button-generate-image"
                    >
                      {generateImageMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Image...
                        </>
                      ) : (
                        <>
                          🖼️ Generate Visual
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Generated Image */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                      <CardTitle>{t('generatedVisual')}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSavedVisuals(!showSavedVisuals)}
                        className="text-gray-500 hover:text-gray-700"
                        data-testid="button-toggle-saved-visuals"
                      >
                        <History className="h-4 w-4 mr-1" />
                        <Badge variant="secondary">{savedVisuals.length}</Badge>
                      </Button>
                    </div>
                    {generatedImageUrl && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveVisual}
                          className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          data-testid="button-save-visual"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setGeneratedImageUrl("")}
                          className="h-8 w-8 p-0 text-gray-700 dark:text-gray-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                          data-testid="button-close-image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {showSavedVisuals && savedVisuals.length > 0 && (
                      <div className="mb-4 border rounded-lg p-3 bg-gray-50">
                        <h4 className="text-sm font-medium mb-2">Saved Visuals ({savedVisuals.length})</h4>
                        <ScrollArea className="h-[200px]">
                          <div className="grid grid-cols-3 gap-2">
                            {savedVisuals.map(item => (
                              <div key={item.id} className="relative group">
                                <img 
                                  src={item.content} 
                                  alt="Saved visual" 
                                  className="w-full h-20 object-cover rounded cursor-pointer border hover:border-blue-500"
                                  onClick={() => setGeneratedImageUrl(item.content)}
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                  onClick={() => deleteSavedItem(item.id, 'visual')}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                    {generatedImageUrl ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <img 
                            src={generatedImageUrl} 
                            alt="Generated marketing visual" 
                            className="w-full rounded-lg shadow-md"
                            data-testid="generated-image"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowFullSizeModal(true)}
                            className="flex-1"
                            data-testid="button-view-image"
                          >
                            🔍 View Full Size
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = generatedImageUrl;
                              link.download = 'marketing-visual.png';
                              link.click();
                            }}
                            className="flex-1"
                            data-testid="button-download-image"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <SaveOptionsDialog
                            content={generatedImageUrl}
                            contentType="image"
                            defaultFileName="generated-visual"
                            defaultDocType="other"
                            disabled={!generatedImageUrl}
                            trigger={
                              <Button
                                variant="outline"
                                className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                data-testid="button-save-visual-main"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        🖼️ <p className="mt-2">Your generated visual will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Generated Content */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                      <CardTitle>Marketing Concept</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSavedMarketing(!showSavedMarketing)}
                        className="text-gray-500 hover:text-gray-700"
                        data-testid="button-toggle-saved-marketing"
                      >
                        <History className="h-4 w-4 mr-1" />
                        <Badge variant="secondary">{savedMarketingContent.length}</Badge>
                      </Button>
                    </div>
                    {createdContent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveMarketingContent}
                        className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        data-testid="button-save-marketing-header"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {showSavedMarketing && savedMarketingContent.length > 0 && (
                      <div className="mb-4 border rounded-lg p-3 bg-gray-50">
                        <h4 className="text-sm font-medium mb-2">Saved Marketing Content ({savedMarketingContent.length})</h4>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {savedMarketingContent.map(item => (
                              <div key={item.id} className="flex items-start justify-between p-2 border rounded bg-white hover:bg-gray-50 group">
                                <div 
                                  className="flex-1 cursor-pointer text-sm line-clamp-2"
                                  onClick={() => setCreatedContent(item.content)}
                                >
                                  {item.content.slice(0, 100)}...
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-500"
                                  onClick={() => deleteSavedItem(item.id, 'marketing')}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                    {createdContent ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <pre className="whitespace-pre-wrap text-sm">{createdContent}</pre>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(createdContent)}
                            className="flex-1"
                            data-testid="button-copy-created"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Content
                          </Button>
                          <SaveOptionsDialog
                            content={createdContent}
                            contentType="text"
                            defaultFileName="marketing-content"
                            defaultDocType="report"
                            disabled={!createdContent}
                            trigger={
                              <Button
                                variant="outline"
                                className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                data-testid="button-save-marketing"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Palette className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Your marketing concept will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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
                    className="w-full bg-[var(--accent)] hover:opacity-90 text-white"
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <CardTitle>Generated Copy</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSavedWrite(!showSavedWrite)}
                      className="text-gray-500 hover:text-gray-700"
                      data-testid="button-toggle-saved-write"
                    >
                      <History className="h-4 w-4 mr-1" />
                      <Badge variant="secondary">{savedWriteContent.length}</Badge>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showSavedWrite && savedWriteContent.length > 0 && (
                    <div className="mb-4 border rounded-lg p-3 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2">Saved Copy ({savedWriteContent.length})</h4>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {savedWriteContent.map(item => (
                            <div key={item.id} className="relative group p-2 border rounded bg-white hover:border-blue-500 cursor-pointer">
                              <pre 
                                className="whitespace-pre-wrap text-xs line-clamp-3"
                                onClick={() => setWrittenContent(item.content)}
                              >
                                {item.content.substring(0, 150)}...
                              </pre>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                onClick={() => deleteSavedItem(item.id, 'write')}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  {writtenContent ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm">{writtenContent}</pre>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(writtenContent)}
                          className="flex-1"
                          data-testid="button-copy-written"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Content
                        </Button>
                        <SaveOptionsDialog
                          content={writtenContent}
                          contentType="text"
                          defaultFileName="generated-copy"
                          defaultDocType="other"
                          disabled={!writtenContent}
                          trigger={
                            <Button
                              variant="outline"
                              className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                              data-testid="button-save-write"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          }
                        />
                      </div>
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
                    className="w-full bg-[var(--signal)] hover:opacity-90 text-white"
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <CardTitle>Promotion Strategy</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSavedPromote(!showSavedPromote)}
                      className="text-gray-500 hover:text-gray-700"
                      data-testid="button-toggle-saved-promote"
                    >
                      <History className="h-4 w-4 mr-1" />
                      <Badge variant="secondary">{savedPromoteContent.length}</Badge>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showSavedPromote && savedPromoteContent.length > 0 && (
                    <div className="mb-4 border rounded-lg p-3 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2">Saved Strategies ({savedPromoteContent.length})</h4>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {savedPromoteContent.map(item => (
                            <div key={item.id} className="relative group p-2 border rounded bg-white hover:border-blue-500 cursor-pointer">
                              <pre 
                                className="whitespace-pre-wrap text-xs line-clamp-3"
                                onClick={() => setPromoteContent(item.content)}
                              >
                                {item.content.substring(0, 150)}...
                              </pre>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                onClick={() => deleteSavedItem(item.id, 'promote')}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  {promoteContent ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm">{promoteContent}</pre>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(promoteContent)}
                          className="flex-1"
                          data-testid="button-copy-promote"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Strategy
                        </Button>
                        <SaveOptionsDialog
                          content={promoteContent}
                          contentType="text"
                          defaultFileName="promotion-strategy"
                          defaultDocType="report"
                          disabled={!promoteContent}
                          trigger={
                            <Button
                              variant="outline"
                              className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                              data-testid="button-save-promote"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          }
                        />
                      </div>
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
                  
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".csv,.txt,.json,.xml,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="track-file-upload"
                      data-testid="input-track-file-upload"
                    />
                    <label
                      htmlFor="track-file-upload"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Upload Data Files</span>
                      <span className="text-xs text-gray-500 mt-1">CSV, TXT, JSON, XML, Excel (max 5MB each)</span>
                    </label>
                  </div>
                  
                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</label>
                      <div className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(file.content.length / 1024)}KB
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUploadedFile(index)}
                              className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                              data-testid={`button-remove-file-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => trackMutation.mutate(getAnalysisData())}
                    disabled={(!trackData.trim() && uploadedFiles.length === 0) || trackMutation.isPending}
                    className="w-full bg-[var(--success)] hover:opacity-90 text-white"
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
                        Analyze Data {uploadedFiles.length > 0 && `(${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''})`}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <CardTitle>Marketing Insights</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSavedTrack(!showSavedTrack)}
                      className="text-gray-500 hover:text-gray-700"
                      data-testid="button-toggle-saved-track"
                    >
                      <History className="h-4 w-4 mr-1" />
                      <Badge variant="secondary">{savedTrackContent.length}</Badge>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showSavedTrack && savedTrackContent.length > 0 && (
                    <div className="mb-4 border rounded-lg p-3 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2">Saved Insights ({savedTrackContent.length})</h4>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {savedTrackContent.map(item => (
                            <div key={item.id} className="relative group p-2 border rounded bg-white hover:border-blue-500 cursor-pointer">
                              <pre 
                                className="whitespace-pre-wrap text-xs line-clamp-3"
                                onClick={() => setTrackInsights(item.content)}
                              >
                                {item.content.substring(0, 150)}...
                              </pre>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                onClick={() => deleteSavedItem(item.id, 'track')}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  {trackInsights ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm">{trackInsights}</pre>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(trackInsights)}
                          className="flex-1"
                          data-testid="button-copy-insights"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Insights
                        </Button>
                        <SaveOptionsDialog
                          content={trackInsights}
                          contentType="text"
                          defaultFileName="marketing-insights"
                          defaultDocType="report"
                          disabled={!trackInsights}
                          trigger={
                            <Button
                              variant="outline"
                              className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                              data-testid="button-save-track"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          }
                        />
                      </div>
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

        {/* Full Size Image Modal */}
        {showFullSizeModal && generatedImageUrl && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullSizeModal(false)}
          >
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullSizeModal(false)}
                className="absolute -top-12 right-0 bg-white hover:bg-gray-100 text-gray-900"
                data-testid="button-close-fullsize"
              >
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
              <img 
                src={generatedImageUrl} 
                alt="Full size visual" 
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}