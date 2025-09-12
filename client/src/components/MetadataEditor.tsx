import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Edit3, Calendar, DollarSign, Hash, Type, ToggleLeft, List } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface MetadataField {
  key: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
  label?: string;
}

interface MetadataEditorProps {
  documentId?: string;
  metadata: Record<string, any>;
  onMetadataChange: (metadata: Record<string, any>) => void;
  documentType?: string;
}

const METADATA_TEMPLATES = {
  proposal: [
    { key: 'project_value', type: 'number', label: 'Project Value' },
    { key: 'client_priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { key: 'expected_duration', type: 'text', label: 'Expected Duration' },
    { key: 'requires_approval', type: 'boolean', label: 'Requires Approval' }
  ],
  invoice: [
    { key: 'amount', type: 'number', label: 'Invoice Amount' },
    { key: 'payment_terms', type: 'text', label: 'Payment Terms' },
    { key: 'due_date', type: 'date', label: 'Due Date' },
    { key: 'paid', type: 'boolean', label: 'Paid' }
  ],
  contract: [
    { key: 'contract_value', type: 'number', label: 'Contract Value' },
    { key: 'start_date', type: 'date', label: 'Start Date' },
    { key: 'end_date', type: 'date', label: 'End Date' },
    { key: 'auto_renew', type: 'boolean', label: 'Auto Renew' }
  ],
  presentation: [
    { key: 'presentation_date', type: 'date', label: 'Presentation Date' },
    { key: 'audience_size', type: 'number', label: 'Audience Size' },
    { key: 'presentation_type', type: 'select', label: 'Type', options: ['Client Pitch', 'Internal', 'Conference', 'Training'] }
  ]
} as Record<string, Partial<MetadataField>[]>;

export function MetadataEditor({ documentId, metadata, onMetadataChange, documentType }: MetadataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingFields, setEditingFields] = useState<Record<string, any>>({});
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState<MetadataField['type']>('text');
  const [isAddingField, setIsAddingField] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateDocumentMetadata = useMutation({
    mutationFn: async (newMetadata: Record<string, any>) => {
      if (!documentId) return;
      const response = await fetch(`/api/client-documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: newMetadata })
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-documents"] });
      toast({ title: "Metadata updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to update metadata", 
        variant: "destructive" 
      });
    }
  });

  const handleSave = () => {
    const updatedMetadata = { ...metadata, ...editingFields };
    onMetadataChange(updatedMetadata);
    
    if (documentId) {
      updateDocumentMetadata.mutate(updatedMetadata);
    }
    
    setEditingFields({});
    setIsOpen(false);
  };

  const addField = () => {
    if (!newFieldKey.trim()) return;
    
    const defaultValue = newFieldType === 'boolean' ? false : 
                        newFieldType === 'number' ? 0 : '';
    
    setEditingFields({
      ...editingFields,
      [newFieldKey]: defaultValue
    });
    
    setNewFieldKey("");
    setNewFieldType('text');
    setIsAddingField(false);
  };

  const removeField = (key: string) => {
    const { [key]: removed, ...rest } = editingFields;
    setEditingFields(rest);
    
    const { [key]: removedFromMetadata, ...restMetadata } = metadata;
    onMetadataChange(restMetadata);
    
    if (documentId) {
      updateDocumentMetadata.mutate(restMetadata);
    }
  };

  const applyTemplate = () => {
    if (!documentType || !METADATA_TEMPLATES[documentType]) return;
    
    const templateFields = METADATA_TEMPLATES[documentType];
    const newFields = templateFields.reduce((acc, field) => {
      if (field.key && !metadata[field.key]) {
        const defaultValue = field.type === 'boolean' ? false : 
                            field.type === 'number' ? 0 : '';
        acc[field.key] = defaultValue;
      }
      return acc;
    }, {} as Record<string, any>);
    
    setEditingFields({ ...editingFields, ...newFields });
  };

  const renderFieldInput = (key: string, field: Partial<MetadataField>, value: any) => {
    const fieldType = field.type || 'text';
    
    switch (fieldType) {
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => setEditingFields({
              ...editingFields,
              [key]: parseFloat(e.target.value) || 0
            })}
            data-testid={`input-metadata-${key}`}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value ? format(new Date(value), 'yyyy-MM-dd') : ''}
            onChange={(e) => setEditingFields({
              ...editingFields,
              [key]: e.target.value
            })}
            data-testid={`input-metadata-${key}`}
          />
        );
      
      case 'boolean':
        return (
          <Select 
            value={value ? 'true' : 'false'}
            onValueChange={(val) => setEditingFields({
              ...editingFields,
              [key]: val === 'true'
            })}
          >
            <SelectTrigger data-testid={`select-metadata-${key}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case 'select':
        return (
          <Select 
            value={value || ''}
            onValueChange={(val) => setEditingFields({
              ...editingFields,
              [key]: val
            })}
          >
            <SelectTrigger data-testid={`select-metadata-${key}`}>
              <SelectValue placeholder="Select option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => setEditingFields({
              ...editingFields,
              [key]: e.target.value
            })}
            data-testid={`input-metadata-${key}`}
          />
        );
    }
  };

  const getFieldIcon = (type: MetadataField['type']) => {
    switch (type) {
      case 'number': return <Hash className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'boolean': return <ToggleLeft className="h-4 w-4" />;
      case 'select': return <List className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  const allFields = { ...metadata, ...editingFields };
  const hasMetadata = Object.keys(allFields).length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Custom Fields</Label>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              data-testid="button-edit-metadata"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              {hasMetadata ? 'Edit Fields' : 'Add Fields'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="dialog-metadata-editor">
            <DialogHeader>
              <DialogTitle>Manage Custom Fields</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Template Quick Actions */}
              {documentType && METADATA_TEMPLATES[documentType] && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quick Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={applyTemplate}
                      data-testid="button-apply-template"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add {documentType} fields
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Existing Fields */}
              <div className="space-y-3">
                {Object.entries(allFields).map(([key, value]) => {
                  const field = METADATA_TEMPLATES[documentType || '']?.find(f => f.key === key) || { type: 'text' as const };
                  
                  return (
                    <div key={key} className="flex items-center gap-3 p-3 border rounded">
                      {getFieldIcon(field.type || 'text')}
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm font-medium capitalize">
                          {field.label || key.replace(/_/g, ' ')}
                        </Label>
                        {renderFieldInput(key, field, editingFields[key] !== undefined ? editingFields[key] : value)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(key)}
                        data-testid={`button-remove-field-${key}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Add New Field */}
              {isAddingField ? (
                <div className="flex items-center gap-3 p-3 border rounded border-dashed">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Field name..."
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      data-testid="input-new-field-name"
                    />
                    <Select value={newFieldType} onValueChange={setNewFieldType}>
                      <SelectTrigger data-testid="select-new-field-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="boolean">Yes/No</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addField} data-testid="button-confirm-add-field">
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddingField(false)}
                      data-testid="button-cancel-add-field"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingField(true)}
                  className="w-full"
                  data-testid="button-add-custom-field"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom Field
                </Button>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} data-testid="button-save-metadata">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingFields({});
                    setIsOpen(false);
                  }}
                  data-testid="button-cancel-metadata"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Display Metadata Summary */}
      {hasMetadata && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(allFields).slice(0, 3).map(([key, value]) => (
            <Badge 
              key={key} 
              variant="secondary" 
              className="text-xs"
              data-testid={`metadata-badge-${key}`}
            >
              {key.replace(/_/g, ' ')}: {String(value)}
            </Badge>
          ))}
          {Object.keys(allFields).length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{Object.keys(allFields).length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}