import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Eye, Calendar, User, Building, Tag, MoreHorizontal, Grid, List } from "lucide-react";
import { format } from "date-fns";
import type { SearchFilters } from "./AdvancedSearchModal";

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  type: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  status: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: string;
    name: string;
    company?: string;
  };
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
  relevanceScore?: number;
  matchedFields?: string[];
}

interface SearchResultsProps {
  results: SearchResult[];
  totalCount: number;
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onDownload: (document: SearchResult) => void;
  onPreview: (document: SearchResult) => void;
  onEdit: (document: SearchResult) => void;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'name', label: 'Name' },
  { value: 'fileSize', label: 'File Size' }
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: '10', label: '10 per page' },
  { value: '25', label: '25 per page' },
  { value: '50', label: '50 per page' },
  { value: '100', label: '100 per page' }
];

export function SearchResults({
  results,
  totalCount,
  isLoading,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  onDownload,
  onPreview,
  onEdit
}: SearchResultsProps) {
  const [previewDocument, setPreviewDocument] = useState<SearchResult | null>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'Unknown';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200">{part}</mark> : 
        part
    );
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy,
      page: 1 // Reset to first page when sorting changes
    });
  };

  const handleSortOrderChange = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    });
  };

  const handleLimitChange = (limit: string) => {
    onFiltersChange({
      ...filters,
      limit: parseInt(limit),
      page: 1 // Reset to first page when limit changes
    });
  };

  const handlePageChange = (page: number) => {
    onFiltersChange({
      ...filters,
      page
    });
  };

  const totalPages = Math.ceil(totalCount / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(filters.page * filters.limit, totalCount);

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="search-results-loading">
        {/* Loading skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <div className="space-y-3">
            {Array.from({ length: filters.limit }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: filters.limit }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="search-results-container">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold" data-testid="text-results-count">
            {totalCount} {totalCount === 1 ? 'result' : 'results'}
            {totalCount > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                (showing {startIndex}-{endIndex})
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Controls */}
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-36" data-testid="select-sort-by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSortOrderChange}
            data-testid="button-sort-order"
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </Button>

          {/* Items per page */}
          <Select value={filters.limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-32" data-testid="select-items-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              data-testid="button-view-list"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              data-testid="button-view-grid"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-3">
              {results.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(document.type)}
                          <h4 className="font-medium text-lg" data-testid={`text-document-name-${document.id}`}>
                            {highlightSearchTerm(document.name, filters.query)}
                          </h4>
                          <Badge className={getStatusColor(document.status)}>
                            {document.status}
                          </Badge>
                          {document.relevanceScore && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(document.relevanceScore * 100)}% match
                            </Badge>
                          )}
                        </div>

                        {document.description && (
                          <p className="text-muted-foreground text-sm" data-testid={`text-document-description-${document.id}`}>
                            {highlightSearchTerm(document.description, filters.query)}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {document.fileName}
                          </span>
                          {document.fileSize && (
                            <span>{formatFileSize(document.fileSize)}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(document.createdAt), 'MMM d, yyyy')}
                          </span>
                          {document.client && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {document.client.name}
                            </span>
                          )}
                          {document.uploadedBy && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {document.uploadedBy.name}
                            </span>
                          )}
                        </div>

                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {document.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {highlightSearchTerm(tag, filters.query)}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {document.matchedFields && document.matchedFields.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Matched in: {document.matchedFields.join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreview(document)}
                          data-testid={`button-preview-${document.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownload(document)}
                          data-testid={`button-download-${document.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(document)}
                          data-testid={`button-edit-${document.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(document.type)}
                        <Badge className={getStatusColor(document.status)}>
                          {document.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreview(document)}
                          data-testid={`button-preview-grid-${document.id}`}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownload(document)}
                          data-testid={`button-download-grid-${document.id}`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <h4 className="font-medium text-sm leading-tight" data-testid={`text-document-name-grid-${document.id}`}>
                      {highlightSearchTerm(document.name, filters.query)}
                    </h4>

                    {document.description && (
                      <p className="text-muted-foreground text-xs line-clamp-2">
                        {highlightSearchTerm(document.description, filters.query)}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>{format(new Date(document.createdAt), 'MMM d')}</span>
                      </div>

                      {document.client && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{document.client.name}</span>
                        </div>
                      )}
                    </div>

                    {document.tags && document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{document.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                data-testid="button-previous-page"
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground px-4" data-testid="text-pagination-info">
                Page {filters.page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
                data-testid="button-next-page"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Document Preview Modal */}
      <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
        <DialogContent className="max-w-2xl">
          {previewDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(previewDocument.type)}
                  {previewDocument.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">File:</span> {previewDocument.fileName}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {formatFileSize(previewDocument.fileSize)}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {previewDocument.type}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <Badge className={getStatusColor(previewDocument.status)}>
                      {previewDocument.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {format(new Date(previewDocument.createdAt), 'PPP')}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {format(new Date(previewDocument.updatedAt), 'PPP')}
                  </div>
                </div>

                {previewDocument.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 text-muted-foreground">{previewDocument.description}</p>
                  </div>
                )}

                {previewDocument.tags && previewDocument.tags.length > 0 && (
                  <div>
                    <span className="font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewDocument.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => onDownload(previewDocument)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => onEdit(previewDocument)}>
                    Edit Details
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}