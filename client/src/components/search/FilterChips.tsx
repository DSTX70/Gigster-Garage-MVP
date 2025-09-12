import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Calendar, FileType, Tag, User, Building, Search } from "lucide-react";
import { format } from "date-fns";
import type { SearchFilters } from "./AdvancedSearchModal";
import type { Client } from "@shared/schema";

interface FilterChipsProps {
  filters: SearchFilters;
  onRemoveFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
  clients: Client[];
  availableTags: string[];
}

export function FilterChips({ 
  filters, 
  onRemoveFilter, 
  onClearAll, 
  clients,
  availableTags 
}: FilterChipsProps) {
  const hasActiveFilters = Boolean(
    filters.query ||
    filters.types.length > 0 ||
    filters.statuses.length > 0 ||
    filters.clientIds.length > 0 ||
    filters.tags.length > 0 ||
    filters.createdDateFrom ||
    filters.createdDateTo ||
    filters.updatedDateFrom ||
    filters.updatedDateTo ||
    filters.fileSizeMin ||
    filters.fileSizeMax ||
    filters.includeArchived ||
    filters.fuzzySearch
  );

  if (!hasActiveFilters) {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border" data-testid="filter-chips-container">
      <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
      
      {/* Search Query */}
      {filters.query && (
        <Badge variant="secondary" className="flex items-center gap-1" data-testid="chip-search-query">
          <Search className="h-3 w-3" />
          <span>"{filters.query}"</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('query')}
            data-testid="button-remove-query"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Document Types */}
      {filters.types.map((type) => (
        <Badge key={type} variant="secondary" className="flex items-center gap-1" data-testid={`chip-type-${type}`}>
          <FileType className="h-3 w-3" />
          <span>{type}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('types', type)}
            data-testid={`button-remove-type-${type}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {/* Document Statuses */}
      {filters.statuses.map((status) => (
        <Badge key={status} variant="secondary" className="flex items-center gap-1" data-testid={`chip-status-${status}`}>
          <span className="inline-block w-2 h-2 rounded-full bg-current" />
          <span>{status}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('statuses', status)}
            data-testid={`button-remove-status-${status}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {/* Clients */}
      {filters.clientIds.map((clientId) => (
        <Badge key={clientId} variant="secondary" className="flex items-center gap-1" data-testid={`chip-client-${clientId}`}>
          <Building className="h-3 w-3" />
          <span>{getClientName(clientId)}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('clientIds', clientId)}
            data-testid={`button-remove-client-${clientId}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {/* Tags */}
      {filters.tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="flex items-center gap-1" data-testid={`chip-tag-${tag}`}>
          <Tag className="h-3 w-3" />
          <span>{tag}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('tags', tag)}
            data-testid={`button-remove-tag-${tag}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {/* Date Ranges */}
      {(filters.createdDateFrom || filters.createdDateTo) && (
        <Badge variant="secondary" className="flex items-center gap-1" data-testid="chip-created-date">
          <Calendar className="h-3 w-3" />
          <span>
            Created: {filters.createdDateFrom ? format(filters.createdDateFrom, 'MMM d') : '∞'} - {filters.createdDateTo ? format(filters.createdDateTo, 'MMM d') : '∞'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('createdDate')}
            data-testid="button-remove-created-date"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {(filters.updatedDateFrom || filters.updatedDateTo) && (
        <Badge variant="secondary" className="flex items-center gap-1" data-testid="chip-updated-date">
          <Calendar className="h-3 w-3" />
          <span>
            Updated: {filters.updatedDateFrom ? format(filters.updatedDateFrom, 'MMM d') : '∞'} - {filters.updatedDateTo ? format(filters.updatedDateTo, 'MMM d') : '∞'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('updatedDate')}
            data-testid="button-remove-updated-date"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* File Size Range */}
      {(filters.fileSizeMin || filters.fileSizeMax) && (
        <Badge variant="secondary" className="flex items-center gap-1" data-testid="chip-file-size">
          <FileType className="h-3 w-3" />
          <span>
            Size: {filters.fileSizeMin ? formatFileSize(filters.fileSizeMin) : '0'} - {filters.fileSizeMax ? formatFileSize(filters.fileSizeMax) : '∞'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('fileSize')}
            data-testid="button-remove-file-size"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Include Archived */}
      {filters.includeArchived && (
        <Badge variant="secondary" className="flex items-center gap-1" data-testid="chip-include-archived">
          <span>Including archived</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('includeArchived')}
            data-testid="button-remove-include-archived"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Fuzzy Search */}
      {filters.fuzzySearch && (
        <Badge variant="secondary" className="flex items-center gap-1" data-testid="chip-fuzzy-search">
          <span>Fuzzy search</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('fuzzySearch')}
            data-testid="button-remove-fuzzy-search"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Tag Logic */}
      {filters.tags.length > 1 && (
        <Badge variant="outline" className="flex items-center gap-1" data-testid="chip-tag-logic">
          <Tag className="h-3 w-3" />
          <span>{filters.tagLogic} logic</span>
        </Badge>
      )}

      {/* Clear All Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onClearAll}
        className="ml-2"
        data-testid="button-clear-all-filters"
      >
        Clear All
      </Button>
    </div>
  );
}