import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Settings, Edit, Trash2, Type, List, Calendar, ToggleLeft, Hash, AlignLeft } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CustomFieldDefinition } from "@shared/schema";

const customFieldSchema = z.object({
  name: z.string().min(1, "Name is required"),
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "textarea", "number", "date", "boolean", "select", "multiselect"]),
  entityType: z.enum(["task", "project", "client"]),
  options: z.array(z.string()).default([]),
  required: z.boolean().default(false),
  defaultValue: z.string().optional(),
  order: z.number().default(0),
});

type CustomFieldFormData = z.infer<typeof customFieldSchema>;

const fieldTypeIcons = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  date: Calendar,
  boolean: ToggleLeft,
  select: List,
  multiselect: List,
};

const fieldTypeLabels = {
  text: "Text",
  textarea: "Textarea",
  number: "Number",
  date: "Date",
  boolean: "Boolean",
  select: "Single Select",
  multiselect: "Multi Select",
};

export default function CustomFields() {
  const [activeTab, setActiveTab] = useState("task");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [optionsInput, setOptionsInput] = useState("");
  const { toast } = useToast();

  // Fetch custom field definitions
  const { data: allFields = [], isLoading, refetch } = useQuery<CustomFieldDefinition[]>({
    queryKey: ["/api/custom-fields"],
  });

  // Filter fields by entity type
  const taskFields = allFields.filter(f => f.entityType === "task");
  const projectFields = allFields.filter(f => f.entityType === "project");
  const clientFields = allFields.filter(f => f.entityType === "client");

  const form = useForm<CustomFieldFormData>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      name: "",
      label: "",
      type: "text",
      entityType: "task",
      options: [],
      required: false,
      defaultValue: "",
      order: 0,
    }
  });

  // Mutations
  const createFieldMutation = useMutation({
    mutationFn: async (data: CustomFieldFormData) => {
      return await apiRequest("POST", "/api/custom-fields", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      toast({ title: "Success", description: "Custom field created successfully" });
      setIsCreateOpen(false);
      form.reset();
      setOptionsInput("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomFieldFormData> }) => {
      return await apiRequest("PUT", `/api/custom-fields/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      toast({ title: "Success", description: "Custom field updated successfully" });
      setEditingField(null);
      form.reset();
      setOptionsInput("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/custom-fields/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      toast({ title: "Success", description: "Custom field deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = async (data: CustomFieldFormData) => {
    // Parse options from comma-separated string
    const options = optionsInput
      ? optionsInput.split(",").map(opt => opt.trim()).filter(opt => opt.length > 0)
      : [];

    const formData = {
      ...data,
      options: ["select", "multiselect"].includes(data.type) ? options : [],
    };

    if (editingField) {
      updateFieldMutation.mutate({ id: editingField.id, data: formData });
    } else {
      createFieldMutation.mutate(formData);
    }
  };

  const handleEdit = (field: CustomFieldDefinition) => {
    setEditingField(field);
    form.reset({
      name: field.name,
      label: field.label,
      type: field.type as any,
      entityType: field.entityType as any,
      options: field.options || [],
      required: field.required ?? false,
      defaultValue: field.defaultValue ?? "",
      order: field.order ?? 0,
    });
    setOptionsInput((field.options || []).join(", "));
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this custom field? This will also remove all associated data.")) {
      deleteFieldMutation.mutate(id);
    }
  };

  const renderFieldsTable = (fields: CustomFieldDefinition[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Required</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No custom fields defined yet
              </TableCell>
            </TableRow>
          ) : (
            fields.map((field) => {
              const Icon = fieldTypeIcons[field.type as keyof typeof fieldTypeIcons];
              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{field.label}</div>
                      <div className="text-sm text-muted-foreground">{field.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <Icon className="w-3 h-3" />
                      {fieldTypeLabels[field.type as keyof typeof fieldTypeLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {field.required ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="secondary">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell>{field.order}</TableCell>
                  <TableCell>{format(new Date(field.createdAt!), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(field)}
                        data-testid={`button-edit-${field.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(field.id)}
                        data-testid={`button-delete-${field.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Custom Fields</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Create and manage user-defined fields for tasks, projects, and clients
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-field">
                  <Plus className="w-4 h-4 mr-2" />
                  New Field
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingField ? "Edit Custom Field" : "Create Custom Field"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field Name</FormLabel>
                            <FormControl>
                              <Input placeholder="field_name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Field Label" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(fieldTypeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="entityType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entity Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="task">Tasks</SelectItem>
                                <SelectItem value="project">Projects</SelectItem>
                                <SelectItem value="client">Clients</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {["select", "multiselect"].includes(form.watch("type")) && (
                      <div>
                        <label className="text-sm font-medium">Options (comma separated)</label>
                        <Textarea
                          value={optionsInput}
                          onChange={(e) => setOptionsInput(e.target.value)}
                          placeholder="Option 1, Option 2, Option 3"
                          className="mt-2"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="defaultValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Value</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional default value" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="required"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Required Field</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateOpen(false);
                          setEditingField(null);
                          form.reset();
                          setOptionsInput("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createFieldMutation.isPending || updateFieldMutation.isPending}
                      >
                        {editingField ? "Update" : "Create"} Field
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Task Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskFields.length}</div>
              <p className="text-xs text-muted-foreground">Custom fields for tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Project Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectFields.length}</div>
              <p className="text-xs text-muted-foreground">Custom fields for projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Client Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientFields.length}</div>
              <p className="text-xs text-muted-foreground">Custom fields for clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Custom Fields Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="task" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Tasks ({taskFields.length})
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Projects ({projectFields.length})
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Clients ({clientFields.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="task" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Custom Fields</CardTitle>
              </CardHeader>
              <CardContent>
                {renderFieldsTable(taskFields)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="project" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Custom Fields</CardTitle>
              </CardHeader>
              <CardContent>
                {renderFieldsTable(projectFields)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="client" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Custom Fields</CardTitle>
              </CardHeader>
              <CardContent>
                {renderFieldsTable(clientFields)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}