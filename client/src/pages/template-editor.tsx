import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Plus, 
  X,
  Settings,
  Code,
  FileText
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Template, InsertTemplate } from "@shared/schema";

const VARIABLE_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];

const TEMPLATE_TYPES = [
  { value: "proposal", label: "Proposal" },
  { value: "contract", label: "Contract" },
  { value: "invoice", label: "Invoice" },
  { value: "deck", label: "Presentation" },
];

interface Variable {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "email" | "phone";
  required: boolean;
  defaultValue?: string;
  placeholder?: string;
}

export default function TemplateEditor() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = id !== "new";

  const [formData, setFormData] = useState<Partial<InsertTemplate>>({
    name: "",
    type: "proposal",
    description: "",
    content: "",
    variables: [],
    tags: [],
    isSystem: false,
    isPublic: false,
    metadata: {},
  });

  const [newVariable, setNewVariable] = useState<Variable>({
    name: "",
    label: "",
    type: "text" as "text" | "textarea" | "number" | "date" | "email" | "phone",
    required: false,
    defaultValue: "",
    placeholder: "",
  });

  const [newTag, setNewTag] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  // Load template data if editing
  const { data: template, isLoading } = useQuery<Template>({
    queryKey: ["/api/templates", id],
    queryFn: () => apiRequest("GET", `/api/templates/${id}`),
    enabled: isEditing,
  });

  // Populate form when template data loads
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type as "proposal" | "contract" | "invoice" | "deck",
        description: template.description || "",
        content: template.content,
        variables: template.variables || [],
        tags: template.tags || [],
        isSystem: template.isSystem,
        isPublic: template.isPublic,
        metadata: template.metadata || {},
      });
    }
  }, [template]);

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: (data: Partial<InsertTemplate>) => {
      if (isEditing) {
        return apiRequest("PATCH", `/api/templates/${id}`, data);
      } else {
        return apiRequest("POST", "/api/templates", data);
      }
    },
    onSuccess: (savedTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: isEditing ? "Template updated" : "Template created",
        description: "Your template has been saved successfully.",
      });
      
      if (!isEditing) {
        setLocation(`/templates/${savedTemplate.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content?.trim()) {
      toast({
        title: "Validation Error",
        description: "Template content is required.",
        variant: "destructive",
      });
      return;
    }

    saveTemplateMutation.mutate(formData);
  };

  const addVariable = () => {
    if (!newVariable.name.trim() || !newVariable.label.trim()) {
      toast({
        title: "Validation Error",
        description: "Variable name and label are required.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate variable names
    if (formData.variables?.some(v => v.name === newVariable.name)) {
      toast({
        title: "Validation Error",
        description: "Variable name already exists.",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      variables: [...(prev.variables || []), { ...newVariable }]
    }));

    setNewVariable({
      name: "",
      label: "",
      type: "text",
      required: false,
      defaultValue: "",
      placeholder: "",
    });
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables?.filter((_, i) => i !== index) || []
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    if (formData.tags?.includes(newTag.trim())) {
      toast({
        title: "Validation Error",
        description: "Tag already exists.",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const generatePreview = () => {
    let content = formData.content || "";
    
    // Replace variables with sample data
    formData.variables?.forEach(variable => {
      const sampleValue = variable.defaultValue || `[Sample ${variable.label}]`;
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      content = content.replace(regex, sampleValue);
    });
    
    setPreviewContent(content);
    setShowPreview(true);
  };

  const insertVariable = (variableName: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = formData.content || "";
      const variableToken = `{{${variableName}}}`;
      
      const newContent = 
        currentContent.substring(0, start) + 
        variableToken + 
        currentContent.substring(end);
      
      setFormData(prev => ({ ...prev, content: newContent }));
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variableToken.length;
        textarea.focus();
      }, 0);
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/templates")}
            data-testid="button-back-to-templates"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Template" : "Create Template"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? "Modify your template" : "Create a new reusable template"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generatePreview}
            data-testid="button-preview-template"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveTemplateMutation.isPending}
            data-testid="button-save-template"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Template Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    data-testid="input-template-name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="select-template-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="textarea-template-description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this template is for"
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex items-center gap-2">
                  <Input
                    data-testid="input-new-tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addTag}
                    data-testid="button-add-tag"
                  >
                    Add
                  </Button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center gap-1"
                        data-testid={`tag-${tag}`}
                      >
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Template Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content-editor">Content *</Label>
                <Textarea
                  id="content-editor"
                  data-testid="textarea-template-content"
                  value={formData.content || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your template content. Use {{variable_name}} for dynamic content."
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use double curly braces to insert variables, e.g., {`{{client.name}}`} or {`{{project.scope}}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variables</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define variables that can be substituted in your template
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Variable Form */}
              <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      data-testid="input-variable-name"
                      value={newVariable.name}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="variable_name"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      data-testid="input-variable-label"
                      value={newVariable.label}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Display Name"
                      className="text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select 
                    value={newVariable.type} 
                    onValueChange={(value: "text" | "textarea" | "number" | "date" | "email" | "phone") => 
                      setNewVariable(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs" data-testid="select-variable-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VARIABLE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      data-testid="input-variable-placeholder"
                      value={newVariable.placeholder || ""}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, placeholder: e.target.value }))}
                      placeholder="Enter placeholder text"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Default Value</Label>
                    <Input
                      data-testid="input-variable-default"
                      value={newVariable.defaultValue || ""}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                      placeholder="Enter default value"
                      className="text-xs"
                    />
                  </div>
                </div>

                <Button 
                  type="button" 
                  size="sm" 
                  onClick={addVariable} 
                  className="w-full"
                  data-testid="button-add-variable"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Variable
                </Button>
              </div>

              {/* Variables List */}
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {formData.variables?.map((variable, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 border rounded text-sm"
                      data-testid={`variable-${variable.name}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{variable.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {`{{${variable.name}}}`} • {variable.type}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertVariable(variable.name)}
                          className="h-6 px-2 text-xs"
                          data-testid={`button-insert-${variable.name}`}
                        >
                          Insert
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariable(index)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          data-testid={`button-remove-${variable.name}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {formData.variables?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No variables defined yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template Preview
            </DialogTitle>
            <DialogDescription>
              Preview how your template will look with sample data
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-4 border rounded-md bg-muted/50">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {previewContent}
              </pre>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}