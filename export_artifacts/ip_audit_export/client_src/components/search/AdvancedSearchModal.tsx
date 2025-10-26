import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Calendar as CalendarIcon, FileType, Tag, User, Building, X } from "lucide-react";
import { format } from "date-fns";
import type { Client } from "@shared/schema";

export interface SearchFilters {
  // Text search
  query: string;
  searchFields: string[];
  
  // Filters
  clientIds: string[];
  types: string[];
  statuses: string[];
  tags: string[];
  tagLogic: 'AND' | 'OR';
  
  // Date ranges
  createdDateFrom?: Date;
  createdDateTo?: Date;
  updatedDateFrom?: Date;
  updatedDateTo?: Date;
  
  // File size
  fileSizeMin?: number;
  fileSizeMax?: number;
  
  // Advanced options
  includeArchived: boolean;
  fuzzySearch: boolean;
  
  // Pagination and sorting
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  clients: Client[];
  availableTags: string[];
  savedSearches: Array<{ id: string; name: string; filters: SearchFilters }>;
  onSaveSearch: (name: string) => void;
  onLoadSearch: (searchId: string) => void;
}

const DOCUMENT_TYPES = [
  { value: "proposal", label: "Proposal" },
  { value: "invoice", label: "Invoice" },
  { value: "contract", label: "Contract" },
  { value: "presentation", label: "Presentation" },
  { value: "report", label: "Report" },
  { value: "agreement", label: "Agreement" },
  { value: "other", label: "Other" }
];

const DOCUMENT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "expired", label: "Expired" }
];

const SEARCH_FIELDS = [
  { value: "name", label: "Document Name" },
  { value: "description", label: "Description" },
  { value: "fileName", label: "File Name" },
  { value: "tags", label: "Tags" }
];

export function AdvancedSearchModal({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  clients,
  availableTags,
  savedSearches,
  onSaveSearch,
  onLoadSearch
}: AdvancedSearchModalProps) {
  const [saveSearchName, setSaveSearchName] = useState("");
  const [selectedDateField, setSelectedDateField] = useState<"created" | "updated">("created");

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to update filters
  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search & Filters
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="search" data-testid="tab-search">Search</TabsTrigger>
              <TabsTrigger value="filters" data-testid="tab-filters">Filters</TabsTrigger>
              <TabsTrigger value="dates" data-testid="tab-dates">Dates & Size</TabsTrigger>
              <TabsTrigger value="saved" data-testid="tab-saved">Saved Searches</TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-query">Search Query</Label>
                  <Input
                    id="search-query"
                    data-testid="input-search-query"
                    placeholder="Enter your search terms..."
                    value={filters.query}
                    onChange={(e) => updateFilters({ query: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Search Fields</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {SEARCH_FIELDS.map((field) => (
                      <div key={field.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`field-${field.value}`}
                          data-testid={`checkbox-field-${field.value}`}
                          checked={filters.searchFields.includes(field.value)}
                          onCheckedChange={(checked) => {
                            const newFields = checked
                              ? [...filters.searchFields, field.value]
                              : filters.searchFields.filter(f => f !== field.value);
                            updateFilters({ searchFields: newFields });
                          }}
                        />
                        <Label htmlFor={`field-${field.value}`}>{field.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fuzzy-search"
                      data-testid="checkbox-fuzzy-search"
                      checked={filters.fuzzySearch}
                      onCheckedChange={(checked) => updateFilters({ fuzzySearch: checked as boolean })}
                    />
                    <Label htmlFor="fuzzy-search">Fuzzy Search</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-archived"
                      data-testid="checkbox-include-archived"
                      checked={filters.includeArchived}
                      onCheckedChange={(checked) => updateFilters({ includeArchived: checked as boolean })}
                    />
                    <Label htmlFor="include-archived">Include Archived</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Types */}
                <div>
                  <Label>Document Types</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {DOCUMENT_TYPES.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type.value}`}
                          data-testid={`checkbox-type-${type.value}`}
                          checked={filters.types.includes(type.value)}
                          onCheckedChange={(checked) => {
                            const newTypes = checked
                              ? [...filters.types, type.value]
                              : filters.types.filter(t => t !== type.value);
                            updateFilters({ types: newTypes });
                          }}
                        />
                        <Label htmlFor={`type-${type.value}`}>{type.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Statuses */}
                <div>
                  <Label>Document Status</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {DOCUMENT_STATUSES.map((status) => (
                      <div key={status.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status.value}`}
                          data-testid={`checkbox-status-${status.value}`}
                          checked={filters.statuses.includes(status.value)}
                          onCheckedChange={(checked) => {
                            const newStatuses = checked
                              ? [...filters.statuses, status.value]
                              : filters.statuses.filter(s => s !== status.value);
                            updateFilters({ statuses: newStatuses });
                          }}
                        />
                        <Label htmlFor={`status-${status.value}`}>{status.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clients */}
                <div>
                  <Label>Clients</Label>
                  <ScrollArea className="h-32 mt-2 border rounded-md p-2">
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`client-${client.id}`}
                          data-testid={`checkbox-client-${client.id}`}
                          checked={filters.clientIds.includes(client.id)}
                          onCheckedChange={(checked) => {
                            const newClients = checked
                              ? [...filters.clientIds, client.id]
                              : filters.clientIds.filter(c => c !== client.id);
                            updateFilters({ clientIds: newClients });
                          }}
                        />
                        <Label htmlFor={`client-${client.id}`} className="text-sm">
                          {client.name}
                          {client.company && <span className="text-muted-foreground"> ({client.company})</span>}
                        </Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Button
                        variant={filters.tagLogic === 'AND' ? 'default' : 'outline'}
                        size="sm"
                        data-testid="button-tag-logic-and"
                        onClick={() => updateFilters({ tagLogic: 'AND' })}
                      >
                        All Tags (AND)
                      </Button>
                      <Button
                        variant={filters.tagLogic === 'OR' ? 'default' : 'outline'}
                        size="sm"
                        data-testid="button-tag-logic-or"
                        onClick={() => updateFilters({ tagLogic: 'OR' })}
                      >
                        Any Tag (OR)
                      </Button>
                    </div>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`tag-${tag}`}
                            data-testid={`checkbox-tag-${tag}`}
                            checked={filters.tags.includes(tag)}
                            onCheckedChange={(checked) => {
                              const newTags = checked
                                ? [...filters.tags, tag]
                                : filters.tags.filter(t => t !== tag);
                              updateFilters({ tags: newTags });
                            }}
                          />
                          <Badge variant="secondary" className="text-xs">{tag}</Badge>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Dates & Size Tab */}
            <TabsContent value="dates" className="space-y-4">
              <div className="space-y-6">
                {/* Date Filters */}
                <div>
                  <Label>Date Range Filter</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={selectedDateField === 'created' ? 'default' : 'outline'}
                      size="sm"
                      data-testid="button-date-created"
                      onClick={() => setSelectedDateField('created')}
                    >
                      Created Date
                    </Button>
                    <Button
                      variant={selectedDateField === 'updated' ? 'default' : 'outline'}
                      size="sm"
                      data-testid="button-date-updated"
                      onClick={() => setSelectedDateField('updated')}
                    >
                      Updated Date
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>From</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                            data-testid={`button-date-from-${selectedDateField}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDateField === 'created' 
                              ? (filters.createdDateFrom ? format(filters.createdDateFrom, 'PPP') : 'Select date')
                              : (filters.updatedDateFrom ? format(filters.updatedDateFrom, 'PPP') : 'Select date')
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDateField === 'created' ? filters.createdDateFrom : filters.updatedDateFrom}
                            onSelect={(date) => {
                              if (selectedDateField === 'created') {
                                updateFilters({ createdDateFrom: date });
                              } else {
                                updateFilters({ updatedDateFrom: date });
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>To</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                            data-testid={`button-date-to-${selectedDateField}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDateField === 'created' 
                              ? (filters.createdDateTo ? format(filters.createdDateTo, 'PPP') : 'Select date')
                              : (filters.updatedDateTo ? format(filters.updatedDateTo, 'PPP') : 'Select date')
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDateField === 'created' ? filters.createdDateTo : filters.updatedDateTo}
                            onSelect={(date) => {
                              if (selectedDateField === 'created') {
                                updateFilters({ createdDateTo: date });
                              } else {
                                updateFilters({ updatedDateTo: date });
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* File Size Filter */}
                <div>
                  <Label>File Size Range</Label>
                  <div className="space-y-4 mt-2">
                    <div className="px-2">
                      <Slider
                        min={0}
                        max={100 * 1024 * 1024} // 100MB max
                        step={1024 * 1024} // 1MB steps
                        value={[filters.fileSizeMin || 0, filters.fileSizeMax || 100 * 1024 * 1024]}
                        onValueChange={([min, max]) => {
                          updateFilters({ 
                            fileSizeMin: min === 0 ? undefined : min,
                            fileSizeMax: max === 100 * 1024 * 1024 ? undefined : max
                          });
                        }}
                        data-testid="slider-file-size"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatFileSize(filters.fileSizeMin || 0)}</span>
                      <span>{formatFileSize(filters.fileSizeMax || 100 * 1024 * 1024)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Saved Searches Tab */}
            <TabsContent value="saved" className="space-y-4">
              <div className="space-y-4">
                {/* Save Current Search */}
                <div>
                  <Label>Save Current Search</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter search name..."
                      value={saveSearchName}
                      onChange={(e) => setSaveSearchName(e.target.value)}
                      data-testid="input-save-search-name"
                    />
                    <Button
                      onClick={() => {
                        if (saveSearchName.trim()) {
                          onSaveSearch(saveSearchName.trim());
                          setSaveSearchName("");
                        }
                      }}
                      disabled={!saveSearchName.trim()}
                      data-testid="button-save-search"
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Saved Searches List */}
                <div>
                  <Label>Saved Searches</Label>
                  <ScrollArea className="h-64 mt-2">
                    {savedSearches.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No saved searches yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedSearches.map((search) => (
                          <div 
                            key={search.id} 
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <span data-testid={`text-saved-search-${search.id}`}>{search.name}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onLoadSearch(search.id)}
                              data-testid={`button-load-search-${search.id}`}
                            >
                              Load
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onReset} data-testid="button-reset-search">
            Reset All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-search">
              Cancel
            </Button>
            <Button onClick={onSearch} data-testid="button-apply-search">
              Apply Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}