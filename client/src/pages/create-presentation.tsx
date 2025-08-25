import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/app-header";
import { Link } from "wouter";
import { ArrowLeft, Presentation, Plus, X, Send, Download, Eye, Monitor, ChevronUp, ChevronDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

interface Slide {
  id: number;
  title: string;
  content: string;
  slideType: 'title' | 'content' | 'image' | 'bullet-points' | 'quote' | 'conclusion';
  order: number;
}

export default function CreatePresentation() {
  const { toast } = useToast();
  const [isPreview, setIsPreview] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    author: "",
    company: "",
    date: new Date().toISOString().split('T')[0],
    projectId: "",
    theme: "modern",
    audience: "",
    objective: "",
    duration: 30,
  });

  // Slides data
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, title: "Introduction", content: "", slideType: 'title', order: 1 },
    { id: 2, title: "Content Slide", content: "", slideType: 'content', order: 2 }
  ]);

  // Character counts
  const [objectiveCount, setObjectiveCount] = useState(0);

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Slide functions
  const addSlide = () => {
    const newId = Math.max(...slides.map(slide => slide.id)) + 1;
    const newOrder = slides.length + 1;
    setSlides([...slides, { 
      id: newId, 
      title: `Slide ${newOrder}`, 
      content: "", 
      slideType: 'content', 
      order: newOrder 
    }]);
  };

  const removeSlide = (id: number) => {
    if (slides.length > 1) {
      setSlides(slides.filter(slide => slide.id !== id).map((slide, index) => ({
        ...slide,
        order: index + 1
      })));
    }
  };

  const updateSlide = (id: number, field: string, value: any) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    ));
  };

  const moveSlide = (id: number, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex(slide => slide.id === id);
    if (
      (direction === 'up' && slideIndex === 0) || 
      (direction === 'down' && slideIndex === slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    
    [newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[slideIndex]];
    
    // Update order numbers
    newSlides.forEach((slide, index) => {
      slide.order = index + 1;
    });
    
    setSlides(newSlides);
  };

  // Save presentation mutation
  const savePresentationMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/presentations", data),
    onSuccess: () => {
      toast({
        title: "Presentation saved",
        description: "Your presentation has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save presentation.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const presentationData = {
      ...formData,
      slides: slides.sort((a, b) => a.order - b.order),
      type: "presentation"
    };
    savePresentationMutation.mutate(presentationData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => setIsPreview(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <div className="space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleSave}>
                <Send className="h-4 w-4 mr-2" />
                Save Presentation
              </Button>
            </div>
          </div>

          {/* Presentation Preview */}
          <div className="space-y-6">
            {slides.sort((a, b) => a.order - b.order).map((slide, index) => (
              <Card key={slide.id} className="aspect-video bg-white">
                <CardContent className="p-8 h-full flex flex-col justify-center">
                  {slide.slideType === 'title' && index === 0 ? (
                    <div className="text-center space-y-4">
                      <h1 className="text-4xl font-bold text-gray-900">{formData.title || "Presentation Title"}</h1>
                      <h2 className="text-xl text-gray-600">{formData.subtitle}</h2>
                      <div className="mt-8 space-y-2">
                        <p className="text-lg font-medium">{formData.author}</p>
                        <p className="text-gray-600">{formData.company}</p>
                        <p className="text-gray-500">{formData.date}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold text-gray-900">{slide.title}</h2>
                      <div className="text-lg text-gray-700 whitespace-pre-wrap">{slide.content || "Slide content goes here..."}</div>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    {index + 1} / {slides.length}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Presentation className="h-8 w-8 text-orange-600" />
                Create Presentation
              </h1>
              <p className="text-gray-600 mt-1">Build professional presentations with multiple slide types</p>
            </div>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={savePresentationMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Save Presentation
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Presentation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Presentation Information</CardTitle>
              <CardDescription>Basic details about your presentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Presentation Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter presentation title"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    placeholder="Optional subtitle"
                    value={formData.subtitle}
                    onChange={(e) => updateFormData("subtitle", e.target.value)}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author/Presenter</Label>
                  <Input
                    id="author"
                    placeholder="Your name"
                    value={formData.author}
                    onChange={(e) => updateFormData("author", e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Your company"
                    value={formData.company}
                    onChange={(e) => updateFormData("company", e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData("date", e.target.value)}
                    className="border-orange-200 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={formData.theme} onValueChange={(value) => updateFormData("theme", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Executives, Team"
                    value={formData.audience}
                    onChange={(e) => updateFormData("audience", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="180"
                    placeholder="30"
                    value={formData.duration}
                    onChange={(e) => updateFormData("duration", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Related Project</Label>
                <Select value={formData.projectId} onValueChange={(value) => updateFormData("projectId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Presentation Objective */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Objective & Goals 
                <Badge variant="outline" className="text-xs">textarea</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What do you want to achieve with this presentation? Key messages, goals, and outcomes..."
                rows={4}
                className="min-h-[100px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                maxLength={1000}
                value={formData.objective}
                onChange={(e) => {
                  updateFormData("objective", e.target.value);
                  setObjectiveCount(e.target.value.length);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>🎯 Define your presentation goals and key messages</span>
                <span className="font-medium">{objectiveCount} / 1,000 characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Slides Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Slides</span>
                <Button size="sm" onClick={addSlide}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slide
                </Button>
              </CardTitle>
              <CardDescription>Manage your presentation slides and content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slides.sort((a, b) => a.order - b.order).map((slide, index) => (
                  <Card key={slide.id} className="border-2 border-orange-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="min-w-[60px] justify-center">
                            Slide {slide.order}
                          </Badge>
                          <Input
                            placeholder="Slide title"
                            value={slide.title}
                            onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                            className="flex-1 border-orange-300"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSlide(slide.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSlide(slide.id, 'down')}
                            disabled={index === slides.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSlide(slide.id)}
                            disabled={slides.length === 1}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Slide Type</Label>
                        <Select 
                          value={slide.slideType} 
                          onValueChange={(value) => updateSlide(slide.id, 'slideType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="title">Title Slide</SelectItem>
                            <SelectItem value="content">Content Slide</SelectItem>
                            <SelectItem value="bullet-points">Bullet Points</SelectItem>
                            <SelectItem value="image">Image Slide</SelectItem>
                            <SelectItem value="quote">Quote</SelectItem>
                            <SelectItem value="conclusion">Conclusion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          Content 
                          <Badge variant="outline" className="text-xs">textarea</Badge>
                        </Label>
                        <Textarea
                          placeholder={
                            slide.slideType === 'bullet-points' 
                              ? "• Point one\n• Point two\n• Point three" 
                              : slide.slideType === 'quote'
                              ? '"Your inspirational quote here"\n- Author Name'
                              : "Enter slide content..."
                          }
                          rows={4}
                          className="min-h-[100px] resize-y bg-orange-50 border-orange-200 focus:border-orange-500"
                          value={slide.content}
                          onChange={(e) => updateSlide(slide.id, 'content', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}