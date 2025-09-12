import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Save, Clock, Star, Filter, Zap } from "lucide-react";
import type { SearchFilters } from "./AdvancedSearchModal";
import type { Client } from "@shared/schema";

interface SearchRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic?: 'AND' | 'OR';
}

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  isStarred: boolean;
}

interface SearchPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  filters: Partial<SearchFilters>;
}

interface SearchBuilderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (filters: SearchFilters) => void;
  clients: Client[];
  availableTags: string[];
  savedSearches: SavedSearch[];
  onSaveSearch: (name: string, description?: string, isStarred?: boolean) => void;
  onDeleteSearch: (searchId: string) => void;
  onStarSearch: (searchId: string, isStarred: boolean) => void;
}

const SEARCH_FIELDS = [
  { value: 'name', label: 'Document Name' },
  { value: 'description', label: 'Description' },
  { value: 'fileName', label: 'File Name' },
  { value: 'type', label: 'Document Type' },
  { value: 'status', label: 'Status' },
  { value: 'tags', label: 'Tags' },
  { value: 'client', label: 'Client' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'fileSize', label: 'File Size' },
  { value: 'metadata', label: 'Metadata' }
];

const OPERATORS = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'notContains', label: 'Does not contain' }
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'notEquals', label: 'Is not' },
    { value: 'in', label: 'Is one of' }
  ],
  date: [
    { value: 'equals', label: 'Is' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greaterThan', label: 'Greater than' },
    { value: 'lessThan', label: 'Less than' },
    { value: 'between', label: 'Between' }
  ]
};

const SEARCH_PRESETS: SearchPreset[] = [
  {
    id: 'recent-files',
    name: 'Recent Files',
    description: 'Documents created in the last 7 days',
    icon: Clock,
    filters: {
      createdDateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  },
  {
    id: 'large-files',
    name: 'Large Files',
    description: 'Files larger than 10MB',
    icon: Zap,
    filters: {
      fileSizeMin: 10 * 1024 * 1024,
      sortBy: 'fileSize',
      sortOrder: 'desc'
    }
  },
  {
    id: 'untagged-docs',
    name: 'Untagged Documents',
    description: 'Documents without any tags',
    icon: Filter,
    filters: {
      // This would need special handling in the backend
    }
  },
  {
    id: 'active-proposals',
    name: 'Active Proposals',
    description: 'Active proposal documents',
    icon: Star,
    filters: {
      types: ['proposal'],
      statuses: ['active'],
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    }
  }
];

export function SearchBuilder({
  isOpen,
  onOpenChange,
  onSearch,
  clients,
  availableTags,
  savedSearches,
  onSaveSearch,
  onDeleteSearch,
  onStarSearch
}: SearchBuilderProps) {
  const [searchRules, setSearchRules] = useState<SearchRule[]>([]);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [saveSearchDescription, setSaveSearchDescription] = useState("");
  const [saveSearchStarred, setSaveSearchStarred] = useState(false);

  const addSearchRule = () => {
    const newRule: SearchRule = {
      id: `rule-${Date.now()}`,
      field: 'name',
      operator: 'contains',
      value: '',
      logic: searchRules.length > 0 ? 'AND' : undefined
    };
    setSearchRules([...searchRules, newRule]);
  };

  const updateSearchRule = (ruleId: string, updates: Partial<SearchRule>) => {
    setSearchRules(rules => 
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    );
  };

  const removeSearchRule = (ruleId: string) => {
    setSearchRules(rules => {
      const filtered = rules.filter(rule => rule.id !== ruleId);
      // Remove logic from first rule if it exists
      if (filtered.length > 0 && filtered[0].logic) {
        filtered[0] = { ...filtered[0], logic: undefined };
      }
      return filtered;
    });
  };

  const getOperatorsForField = (field: string) => {
    switch (field) {
      case 'createdAt':
      case 'updatedAt':
        return OPERATORS.date;
      case 'fileSize':
        return OPERATORS.number;
      case 'type':
      case 'status':
      case 'client':
        return OPERATORS.select;
      default:
        return OPERATORS.text;
    }
  };

  const buildFiltersFromRules = (): SearchFilters => {
    // Convert search rules to SearchFilters format
    const filters: SearchFilters = {
      query: '',
      searchFields: ['name', 'description', 'fileName', 'tags'],
      clientIds: [],
      types: [],
      statuses: [],
      tags: [],
      tagLogic: 'AND',
      includeArchived: false,
      fuzzySearch: false,
      page: 1,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    searchRules.forEach(rule => {
      switch (rule.field) {
        case 'name':
        case 'description':
        case 'fileName':
          if (rule.operator === 'contains' && rule.value) {
            filters.query = rule.value;
            filters.searchFields = [rule.field];
          }
          break;
        case 'type':
          if (rule.value) {
            filters.types = [rule.value];
          }
          break;
        case 'status':
          if (rule.value) {
            filters.statuses = [rule.value];
          }
          break;
        case 'tags':
          if (rule.value) {
            filters.tags = [rule.value];
          }
          break;
        case 'client':
          if (rule.value) {
            filters.clientIds = [rule.value];
          }
          break;
        case 'createdAt':
          if (rule.operator === 'after' && rule.value) {
            filters.createdDateFrom = new Date(rule.value);
          } else if (rule.operator === 'before' && rule.value) {
            filters.createdDateTo = new Date(rule.value);
          }
          break;
        case 'fileSize':
          if (rule.operator === 'greaterThan' && rule.value) {
            filters.fileSizeMin = parseInt(rule.value) * 1024 * 1024; // Convert MB to bytes
          } else if (rule.operator === 'lessThan' && rule.value) {
            filters.fileSizeMax = parseInt(rule.value) * 1024 * 1024;
          }
          break;
      }
    });

    return filters;
  };

  const applySearch = () => {
    const filters = buildFiltersFromRules();
    onSearch(filters);
    onOpenChange(false);
  };

  const applyPreset = (preset: SearchPreset) => {
    const baseFilters: SearchFilters = {
      query: '',
      searchFields: ['name', 'description', 'fileName', 'tags'],
      clientIds: [],
      types: [],
      statuses: [],
      tags: [],
      tagLogic: 'AND',
      includeArchived: false,
      fuzzySearch: false,
      page: 1,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...preset.filters
    };
    onSearch(baseFilters);
    onOpenChange(false);
  };

  const loadSavedSearch = (search: SavedSearch) => {
    onSearch(search.filters);
    onOpenChange(false);
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      onSaveSearch(saveSearchName.trim(), saveSearchDescription.trim() || undefined, saveSearchStarred);
      setSaveSearchName("");
      setSaveSearchDescription("");
      setSaveSearchStarred(false);
    }
  };

  const clearBuilder = () => {
    setSearchRules([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Builder
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(90vh-120px)]">
          {/* Search Rules Builder */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Build Search Query</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearBuilder} data-testid="button-clear-builder">
                  Clear All
                </Button>
                <Button size="sm" onClick={addSearchRule} data-testid="button-add-rule">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {searchRules.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">No search rules yet</h4>
                      <p className="text-muted-foreground mb-4">
                        Add rules to build your custom search query
                      </p>
                      <Button onClick={addSearchRule} data-testid="button-add-first-rule">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Rule
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  searchRules.map((rule, index) => (
                    <Card key={rule.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Logic Operator */}
                          {index > 0 && (
                            <div className="flex justify-center">
                              <div className="flex gap-2">
                                <Button
                                  variant={rule.logic === 'AND' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateSearchRule(rule.id, { logic: 'AND' })}
                                  data-testid={`button-logic-and-${rule.id}`}
                                >
                                  AND
                                </Button>
                                <Button
                                  variant={rule.logic === 'OR' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateSearchRule(rule.id, { logic: 'OR' })}
                                  data-testid={`button-logic-or-${rule.id}`}
                                >
                                  OR
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Rule Configuration */}
                          <div className="grid grid-cols-12 gap-2 items-end">
                            {/* Field Selection */}
                            <div className="col-span-3">
                              <Label>Field</Label>
                              <Select
                                value={rule.field}
                                onValueChange={(value) => updateSearchRule(rule.id, { field: value, operator: 'contains', value: '' })}
                              >
                                <SelectTrigger data-testid={`select-field-${rule.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SEARCH_FIELDS.map((field) => (
                                    <SelectItem key={field.value} value={field.value}>
                                      {field.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Operator Selection */}
                            <div className="col-span-3">
                              <Label>Operator</Label>
                              <Select
                                value={rule.operator}
                                onValueChange={(value) => updateSearchRule(rule.id, { operator: value })}
                              >
                                <SelectTrigger data-testid={`select-operator-${rule.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getOperatorsForField(rule.field).map((operator) => (
                                    <SelectItem key={operator.value} value={operator.value}>
                                      {operator.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Value Input */}
                            <div className="col-span-5">
                              <Label>Value</Label>
                              {rule.field === 'client' ? (
                                <Select
                                  value={rule.value}
                                  onValueChange={(value) => updateSearchRule(rule.id, { value })}
                                >
                                  <SelectTrigger data-testid={`select-value-${rule.id}`}>
                                    <SelectValue placeholder="Select client..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {clients.map((client) => (
                                      <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : rule.field === 'tags' ? (
                                <Select
                                  value={rule.value}
                                  onValueChange={(value) => updateSearchRule(rule.id, { value })}
                                >
                                  <SelectTrigger data-testid={`select-tag-value-${rule.id}`}>
                                    <SelectValue placeholder="Select tag..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableTags.map((tag) => (
                                      <SelectItem key={tag} value={tag}>
                                        {tag}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : rule.field === 'type' ? (
                                <Select
                                  value={rule.value}
                                  onValueChange={(value) => updateSearchRule(rule.id, { value })}
                                >
                                  <SelectTrigger data-testid={`select-type-value-${rule.id}`}>
                                    <SelectValue placeholder="Select type..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="proposal">Proposal</SelectItem>
                                    <SelectItem value="invoice">Invoice</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="presentation">Presentation</SelectItem>
                                    <SelectItem value="report">Report</SelectItem>
                                    <SelectItem value="agreement">Agreement</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : rule.field === 'status' ? (
                                <Select
                                  value={rule.value}
                                  onValueChange={(value) => updateSearchRule(rule.id, { value })}
                                >
                                  <SelectTrigger data-testid={`select-status-value-${rule.id}`}>
                                    <SelectValue placeholder="Select status..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  placeholder="Enter value..."
                                  value={rule.value}
                                  onChange={(e) => updateSearchRule(rule.id, { value: e.target.value })}
                                  data-testid={`input-value-${rule.id}`}
                                />
                              )}
                            </div>

                            {/* Remove Button */}
                            <div className="col-span-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSearchRule(rule.id)}
                                data-testid={`button-remove-rule-${rule.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={applySearch} disabled={searchRules.length === 0} data-testid="button-apply-search-builder">
                Apply Search
              </Button>
              {searchRules.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-save-search-builder">
                      <Save className="h-4 w-4 mr-2" />
                      Save Search
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Search</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="search-name">Search Name</Label>
                        <Input
                          id="search-name"
                          placeholder="Enter search name..."
                          value={saveSearchName}
                          onChange={(e) => setSaveSearchName(e.target.value)}
                          data-testid="input-save-search-name-builder"
                        />
                      </div>
                      <div>
                        <Label htmlFor="search-description">Description (optional)</Label>
                        <Input
                          id="search-description"
                          placeholder="Enter description..."
                          value={saveSearchDescription}
                          onChange={(e) => setSaveSearchDescription(e.target.value)}
                          data-testid="input-save-search-description"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="search-starred"
                          checked={saveSearchStarred}
                          onChange={(e) => setSaveSearchStarred(e.target.checked)}
                          data-testid="checkbox-save-search-starred"
                        />
                        <Label htmlFor="search-starred">Star this search</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSaveSearchName("")}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Presets and Saved Searches */}
          <div className="space-y-4">
            {/* Quick Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SEARCH_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => applyPreset(preset)}
                    data-testid={`button-preset-${preset.id}`}
                  >
                    <preset.icon className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">{preset.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Separator />

            {/* Saved Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Saved Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {savedSearches.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No saved searches yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedSearches
                        .sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0))
                        .map((search) => (
                        <div
                          key={search.id}
                          className="flex items-start gap-2 p-2 border rounded-md hover:bg-muted/50"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onStarSearch(search.id, !search.isStarred)}
                            data-testid={`button-star-search-${search.id}`}
                          >
                            <Star className={`h-3 w-3 ${search.isStarred ? 'fill-current text-yellow-500' : ''}`} />
                          </Button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm truncate" data-testid={`text-search-name-${search.id}`}>
                                {search.name}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => loadSavedSearch(search)}
                                  data-testid={`button-load-saved-search-${search.id}`}
                                >
                                  Load
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteSearch(search.id)}
                                  data-testid={`button-delete-search-${search.id}`}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {search.description && (
                              <p className="text-xs text-muted-foreground mt-1">{search.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>Used {search.usageCount} times</span>
                              {search.lastUsed && (
                                <span>• Last used {new Date(search.lastUsed).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}