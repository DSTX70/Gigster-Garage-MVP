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
  { value: "currency", label: "Currency" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "line_items", label: "Line Items" },
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
  type: "text" | "textarea" | "number" | "currency" | "date" | "email" | "phone" | "line_items";
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
    type: "text" as "text" | "textarea" | "number" | "currency" | "date" | "email" | "phone" | "line_items",
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
    queryFn: async () => {
      return await apiRequest("GET", `/api/templates/${id}`);
    },
    enabled: isEditing,
  });

  // Populate form when template data loads
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type,
        description: template.description || "",
        content: template.content || "",
        variables: Array.isArray(template.variables) ? template.variables : [],
        tags: Array.isArray(template.tags) ? template.tags : [],
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
        setLocation(`/templates/${(savedTemplate as any).id}`);
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
        description: `Variable name and label are required. Name: "${newVariable.name}", Label: "${newVariable.label}"`,
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

    // Reset the form
    setNewVariable({
      name: "",
      label: "",
      type: "text" as const,
      required: false,
      defaultValue: "",
      placeholder: "",
    });

    toast({
      title: "Success",
      description: "Variable added successfully.",
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
    // Generate a preview based on form fields instead of template content
    if (!formData.variables || formData.variables.length === 0) {
      setPreviewContent("No form fields to preview. Please add fields using the Variables panel first.");
      setShowPreview(true);
      return;
    }
    
    // Create a formatted document from the form fields
    let content = `# ${formData.name || 'Template Preview'}\n\n`;
    content += `**Type:** ${formData.type}\n\n`;
    
    if (formData.description) {
      content += `${formData.description}\n\n`;
    }
    
    content += `---\n\n`;
    
    // Add each field with sample data
    formData.variables.forEach(variable => {
      const sampleValue = variable.defaultValue || getSampleValueForType(variable.type, variable.label);
      content += `**${variable.label}${variable.required ? ' *' : ''}:**\n`;
      content += `${sampleValue}\n\n`;
    });
    
    content += `---\n\n*This preview shows how your form data will be formatted into a document.*`;
    
    setPreviewContent(content);
    setShowPreview(true);
  };

  // Helper function to generate sample values based on variable type
  const getSampleValueForType = (type: string, label: string) => {
    switch (type) {
      case "email":
        return "example@company.com";
      case "phone":
        return "(555) 123-4567";
      case "date":
        return new Date().toLocaleDateString();
      case "number":
        return "1000";
      case "textarea":
        return `Sample ${label} content that demonstrates how this longer text field will appear in the final document.`;
      default:
        return `Sample ${label}`;
    }
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

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variables</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define form fields that will capture data when users fill out your template
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
                    onValueChange={(value: "text" | "textarea" | "number" | "date" | "email" | "phone" | "line_items") => 
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

          {/* Form Builder Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Form Builder Preview
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill out these fields to test how your form will work for users
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Form field count info */}
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">📝 Form Status:</span>
                    <span>{(formData.variables || []).length} field{(formData.variables || []).length !== 1 ? 's' : ''} defined</span>
                  </div>
                  {(formData.variables || []).length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Use the Variables panel above to add data entry fields
                    </p>
                  )}
                </div>
                
                {/* Interactive form fields for testing */}
                {(formData.variables || []).length > 0 ? (
                  <div className="border rounded-lg p-4 bg-white dark:bg-gray-950">
                    <h4 className="font-medium mb-4">Interactive Form (test your fields):</h4>
                    <div className="space-y-4">
                      {(formData.variables || []).map((variable: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">{variable.label}</Label>
                            {variable.required && <span className="text-red-500 text-xs">*</span>}
                            <Badge variant="outline" className="text-xs">{variable.type}</Badge>
                          </div>
                          
                          {/* Render actual interactive inputs */}
                          {variable.type === 'textarea' && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder={variable.placeholder || `Enter detailed ${variable.label.toLowerCase()}...`}
                                rows={6}
                                className="min-h-[120px] resize-y bg-orange-50 dark:bg-orange-950 border-orange-200 focus:border-orange-500"
                                maxLength={1000}
                                data-testid={`preview-field-${variable.name}`}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>📝 For detailed descriptions and multi-line content</span>
                                <span className="font-medium">0 / 1,000 characters</span>
                              </div>
                            </div>
                          )}
                          
                          {variable.type === 'number' && (
                            <div className="space-y-2">
                              <Input
                                type="number"
                                placeholder={variable.placeholder || "Enter numeric value"}
                                className="text-right"
                                min="0"
                                step="1"
                                data-testid={`preview-field-${variable.name}`}
                              />
                              <p className="text-xs text-muted-foreground">
                                🔢 Numeric input field (whole or decimal numbers)
                              </p>
                            </div>
                          )}

                          {variable.type === 'currency' && (
                            <div className="space-y-2">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                                <Input
                                  type="number"
                                  placeholder={variable.placeholder || "0.00"}
                                  className="pl-8 text-right bg-green-50 dark:bg-green-950 border-green-200 focus:border-green-500"
                                  min="0"
                                  step="0.01"
                                  data-testid={`preview-field-${variable.name}`}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                💰 Currency amount in USD with automatic $ symbol
                              </p>
                            </div>
                          )}
                          
                          {variable.type === 'date' && (
                            <div className="space-y-2">
                              <Input
                                type="date"
                                className="w-full"
                                data-testid={`preview-field-${variable.name}`}
                              />
                              <p className="text-xs text-muted-foreground">
                                📅 Select a date from the calendar picker
                              </p>
                            </div>
                          )}
                          
                          {variable.type === 'email' && (
                            <div className="space-y-2">
                              <Input
                                type="email"
                                placeholder={variable.placeholder || "name@company.com"}
                                autoComplete="email"
                                data-testid={`preview-field-${variable.name}`}
                              />
                              <p className="text-xs text-muted-foreground">
                                📧 Valid email format required
                              </p>
                            </div>
                          )}
                          
                          {variable.type === 'phone' && (
                            <div className="space-y-2">
                              <Input
                                type="tel"
                                placeholder={variable.placeholder || "+1 (555) 123-4567"}
                                autoComplete="tel"
                                pattern="[0-9\-\+\s\(\)]*"
                                data-testid={`preview-field-${variable.name}`}
                              />
                              <p className="text-xs text-muted-foreground">
                                📞 Include country code for international numbers
                              </p>
                            </div>
                          )}
                          
                          {variable.type === 'text' && (
                            <div className="space-y-2">
                              <Input
                                type="text"
                                placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}`}
                                autoComplete="off"
                                data-testid={`preview-field-${variable.name}`}
                              />
                              <p className="text-xs text-muted-foreground">
                                ✏️ Short text input field
                              </p>
                            </div>
                          )}
                          
                          {variable.type === 'line_items' && (
                            <div className="space-y-3">
                              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                                💰 <strong>Itemized Billing:</strong> Add line items with descriptions, quantities, and costs. Subtotals calculate automatically.
                              </div>
                              
                              {/* Simplified line items table for preview */}
                              <div className="border rounded-lg overflow-hidden">
                                <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 dark:bg-gray-900 text-sm font-medium border-b">
                                  <div className="col-span-5">Description</div>
                                  <div className="col-span-2 text-center">Qty</div>
                                  <div className="col-span-3 text-right">Cost</div>
                                  <div className="col-span-2 text-right">Subtotal</div>
                                </div>
                                
                                <div className="grid grid-cols-12 gap-2 p-3 border-b bg-white dark:bg-gray-950">
                                  <div className="col-span-5">
                                    <Input
                                      placeholder="Enter description..."
                                      className="h-9"
                                      data-testid={`preview-field-${variable.name}-desc`}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      type="number"
                                      placeholder="1"
                                      className="h-9 text-center"
                                      min="0"
                                      step="1"
                                      data-testid={`preview-field-${variable.name}-qty`}
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm">$</span>
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="h-9 pl-7 text-right"
                                        min="0"
                                        step="0.01"
                                        data-testid={`preview-field-${variable.name}-cost`}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-2 flex items-center justify-center">
                                    <span className="text-right font-medium">$0.00</span>
                                  </div>
                                </div>
                                
                                {/* Total Row */}
                                <div className="grid grid-cols-12 gap-2 p-3 bg-blue-50 dark:bg-blue-950">
                                  <div className="col-span-10 text-right font-bold">Total:</div>
                                  <div className="col-span-2 text-right font-bold text-lg">
                                    $0.00
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-xs text-muted-foreground">
                                💰 This is a preview - actual line items will have full add/remove functionality
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <h4 className="font-medium mb-1">No Form Fields Yet</h4>
                    <p className="text-sm mb-4">Your template will be built from data entry fields</p>
                    <div className="text-xs text-left max-w-md mx-auto space-y-1">
                      <p>• <strong>Text:</strong> Short inputs (names, titles)</p>
                      <p>• <strong>Textarea:</strong> Long content with character count</p>
                      <p>• <strong>Number:</strong> Numeric inputs (whole/decimal)</p>
                      <p>• <strong>Currency:</strong> Money amounts with $ symbol</p>
                      <p>• <strong>Date:</strong> Calendar picker for dates</p>
                      <p>• <strong>Email/Phone:</strong> Validated contact fields</p>
                      <p>• <strong>Line Items:</strong> Interactive itemized billing tables</p>
                    </div>
                  </div>
                )}
              </div>
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