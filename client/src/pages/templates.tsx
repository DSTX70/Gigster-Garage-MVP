import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Edit, Trash2, Copy, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@shared/schema";

const TEMPLATE_TYPES = [
  { value: "proposal", label: "Proposals", icon: FileText },
  { value: "contract", label: "Contracts", icon: FileText },
  { value: "invoice", label: "Invoices", icon: FileText },
  { value: "deck", label: "Presentations", icon: FileText },
];

export default function Templates() {
  const [activeTab, setActiveTab] = useState<string>("proposal");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates", activeTab],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/templates?type=${activeTab}`);
      return Array.isArray(response) ? response : [];
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId: string) => apiRequest("DELETE", `/api/templates/${templateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template deleted",
        description: "Template has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    },
  });

  const duplicateTemplateMutation = useMutation({
    mutationFn: async (template: Template) => {
      const duplicateData = {
        name: `${template.name} (Copy)`,
        type: template.type,
        description: template.description,
        content: template.content,
        variables: template.variables,
        tags: template.tags,
        metadata: template.metadata,
      };
      return apiRequest("POST", "/api/templates", duplicateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template duplicated",
        description: "Template has been successfully duplicated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to duplicate template.",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = templates.filter((template: Template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Library</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable document templates
          </p>
        </div>
        <Button data-testid="button-new-template">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="input-search-templates"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Template Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {TEMPLATE_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger
                key={type.value}
                value={type.value}
                data-testid={`tab-${type.value}`}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TEMPLATE_TYPES.map((type) => (
          <TabsContent key={type.value} value={type.value}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-4/5" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No {type.label.toLowerCase()} found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No templates match your search criteria."
                      : `Create your first ${type.label.toLowerCase().slice(0, -1)} template to get started.`}
                  </p>
                  {!searchQuery && (
                    <Button data-testid={`button-create-${type.value}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create {type.label.slice(0, -1)} Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template: Template) => (
                  <Card
                    key={template.id}
                    data-testid={`template-card-${template.id}`}
                    className="group hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {template.description || "No description provided"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to edit template
                            }}
                            data-testid={`button-edit-${template.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateTemplateMutation.mutate(template);
                            }}
                            data-testid={`button-duplicate-${template.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            data-testid={`button-delete-${template.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Tags */}
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(template.createdAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            {template.isSystem && (
                              <Badge variant="outline" className="text-xs">
                                System
                              </Badge>
                            )}
                            {template.isPublic && (
                              <Badge variant="outline" className="text-xs">
                                Public
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Variables count */}
                        {template.variables && Array.isArray(template.variables) && template.variables.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}