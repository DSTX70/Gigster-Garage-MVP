import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CustomFieldDefinition, CustomFieldValue } from "@shared/schema";
import type { UseFormReturn } from "react-hook-form";

interface CustomFieldRendererProps {
  entityType: 'task' | 'project' | 'client';
  entityId?: string; // Optional for new entities
  form: UseFormReturn<any>;
  className?: string;
}

interface CustomFieldData {
  [fieldId: string]: string | boolean | string[] | Date | number | null;
}

export function CustomFieldRenderer({ entityType, entityId, form, className = "" }: CustomFieldRendererProps) {
  const [customFieldData, setCustomFieldData] = useState<CustomFieldData>({});
  const { toast } = useToast();

  // Fetch custom field definitions for this entity type
  const { data: definitions = [] } = useQuery<CustomFieldDefinition[]>({
    queryKey: ["/api/custom-fields"],
    enabled: true,
  });

  // Filter definitions by entity type
  const filteredDefinitions = definitions.filter(def => def.entityType === entityType);

  // Fetch existing custom field values if entityId is provided
  const { data: existingValues = [] } = useQuery<CustomFieldValue[]>({
    queryKey: ["/api/custom-field-values", entityType, entityId],
    enabled: !!entityId,
  });

  // Initialize custom field data when definitions or existing values change
  useEffect(() => {
    const initialData: CustomFieldData = {};
    
    filteredDefinitions.forEach(definition => {
      const existingValue = existingValues.find(val => val.fieldId === definition.id);
      
      if (existingValue) {
        // Parse existing value based on field type
        const rawValue = existingValue.value;
        switch (definition.type) {
          case 'boolean':
            initialData[definition.id] = typeof rawValue === 'boolean' ? rawValue : rawValue === 'true';
            break;
          case 'number':
            initialData[definition.id] = typeof rawValue === 'number' ? rawValue : (rawValue ? parseFloat(String(rawValue)) : 0);
            break;
          case 'date':
            initialData[definition.id] = rawValue ? new Date(String(rawValue)) : null;
            break;
          case 'multiselect':
            initialData[definition.id] = Array.isArray(rawValue) ? rawValue : [];
            break;
          default:
            initialData[definition.id] = rawValue ? String(rawValue) : '';
        }
      } else {
        // Set default value
        switch (definition.type) {
          case 'boolean':
            initialData[definition.id] = (definition.defaultValue ?? '') === 'true';
            break;
          case 'number':
            initialData[definition.id] = definition.defaultValue ? parseFloat(definition.defaultValue) : 0;
            break;
          case 'multiselect':
            initialData[definition.id] = [];
            break;
          default:
            initialData[definition.id] = definition.defaultValue ?? '';
        }
      }
    });

    setCustomFieldData(initialData);
  }, [filteredDefinitions, existingValues]);

  // Mutation to save custom field values
  const saveCustomFieldMutation = useMutation({
    mutationFn: async (values: { fieldId: string; value: string }[]) => {
      const promises = values.map(({ fieldId, value }) =>
        apiRequest("POST", "/api/custom-field-values", {
          fieldId,
          entityType,
          entityId,
          value,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-field-values", entityType, entityId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to save custom fields: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Function to save custom field values (called externally)
  const saveCustomFields = async () => {
    if (!entityId) return;

    const valuesToSave = Object.entries(customFieldData).map(([fieldId, value]) => {
      let serializedValue: string;
      
      if (value === null || value === undefined) {
        serializedValue = '';
      } else if (typeof value === 'boolean') {
        serializedValue = value.toString();
      } else if (value instanceof Date) {
        serializedValue = value.toISOString();
      } else if (Array.isArray(value)) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = value.toString();
      }

      return { fieldId, value: serializedValue };
    });

    await saveCustomFieldMutation.mutateAsync(valuesToSave);
  };

  // Expose save function to parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).saveCustomFields = saveCustomFields;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).saveCustomFields;
      }
    };
  }, [customFieldData, entityId]);

  const updateCustomField = (fieldId: string, value: any) => {
    setCustomFieldData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (definition: CustomFieldDefinition) => {
    const value = customFieldData[definition.id];

    switch (definition.type) {
      case 'text':
        return (
          <FormItem key={definition.id} className="space-y-2">
            <FormLabel className={definition.required ? "required" : ""}>
              {definition.label}
            </FormLabel>
            <FormControl>
              <Input
                value={(value as string) || ''}
                onChange={(e) => updateCustomField(definition.id, e.target.value)}
                placeholder={definition.defaultValue ?? ''}
                required={definition.required ?? false}
                data-testid={`custom-field-${definition.name}`}
              />
            </FormControl>
          </FormItem>
        );

      case 'textarea':
        return (
          <FormItem key={definition.id} className="space-y-2">
            <FormLabel className={definition.required ? "required" : ""}>
              {definition.label}
            </FormLabel>
            <FormControl>
              <Textarea
                value={(value as string) || ''}
                onChange={(e) => updateCustomField(definition.id, e.target.value)}
                placeholder={definition.defaultValue ?? ''}
                required={definition.required ?? false}
                rows={3}
                data-testid={`custom-field-${definition.name}`}
              />
            </FormControl>
          </FormItem>
        );

      case 'number':
        return (
          <FormItem key={definition.id} className="space-y-2">
            <FormLabel className={definition.required ? "required" : ""}>
              {definition.label}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                value={typeof value === 'number' ? value.toString() : ''}
                onChange={(e) => updateCustomField(definition.id, e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder={definition.defaultValue ?? ''}
                required={definition.required ?? false}
                data-testid={`custom-field-${definition.name}`}
              />
            </FormControl>
          </FormItem>
        );

      case 'date':
        return (
          <FormItem key={definition.id} className="space-y-2">
            <FormLabel className={definition.required ? "required" : ""}>
              {definition.label}
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !value && "text-muted-foreground"
                    )}
                    data-testid={`custom-field-${definition.name}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value instanceof Date ? format(value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value instanceof Date ? value : undefined}
                  onSelect={(date) => updateCustomField(definition.id, date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormItem>
        );

      case 'boolean':
        return (
          <FormItem key={definition.id} className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
            <div className="space-y-0.5">
              <FormLabel className={definition.required ? "required" : ""}>
                {definition.label}
              </FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={Boolean(value ?? false)}
                onCheckedChange={(checked) => updateCustomField(definition.id, checked)}
                data-testid={`custom-field-${definition.name}`}
              />
            </FormControl>
          </FormItem>
        );

      case 'select':
        return (
          <FormItem key={definition.id} className="space-y-2">
            <FormLabel className={definition.required ? "required" : ""}>
              {definition.label}
            </FormLabel>
            <Select 
              value={(value as string) || ''} 
              onValueChange={(newValue) => updateCustomField(definition.id, newValue)}
            >
              <FormControl>
                <SelectTrigger data-testid={`custom-field-${definition.name}`}>
                  <SelectValue placeholder={`Select ${definition.label.toLowerCase()}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {definition.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        );

      case 'multiselect':
        return (
          <FormItem key={definition.id} className="space-y-3">
            <FormLabel className={definition.required ? "required" : ""}>
              {definition.label}
            </FormLabel>
            <div className="space-y-2" data-testid={`custom-field-${definition.name}`}>
              {definition.options?.map((option) => {
                const selectedValues = (value as string[]) || [];
                const isChecked = selectedValues.includes(option);
                
                return (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${definition.id}-${option}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentValues = (value as string[]) || [];
                        if (checked) {
                          updateCustomField(definition.id, [...currentValues, option]);
                        } else {
                          updateCustomField(definition.id, currentValues.filter(v => v !== option));
                        }
                      }}
                    />
                    <label
                      htmlFor={`${definition.id}-${option}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option}
                    </label>
                  </div>
                );
              })}
            </div>
          </FormItem>
        );

      default:
        return null;
    }
  };

  if (filteredDefinitions.length === 0) {
    return null; // No custom fields defined
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-4">Custom Fields</h3>
        <div className="space-y-4">
          {filteredDefinitions
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(renderField)}
        </div>
      </div>
    </div>
  );
}

// Export the component and save function reference
export { CustomFieldRenderer as default };

// Helper to get custom field data for saving
export const getCustomFieldData = (): CustomFieldData => {
  return (typeof window !== 'undefined' && (window as any).customFieldData) || {};
};

// Helper to trigger save from outside the component
export const triggerCustomFieldSave = async (): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).saveCustomFields) {
    await (window as any).saveCustomFields();
  }
};