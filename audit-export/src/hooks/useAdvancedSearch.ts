import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SearchFilters } from "@/components/search/AdvancedSearchModal";
import type { Client } from "@shared/schema";

export interface DocumentSearchResult {
  id: string;
  name: string;
  description?: string;
  type: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  status: string;
  tags?: string[];
  metadata?: Record<string, any>;
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

export interface DocumentSearchFacets {
  types: Array<{ value: string; count: number }>;
  statuses: Array<{ value: string; count: number }>;
  clients: Array<{ id: string; name: string; count: number }>;
  tags: Array<{ value: string; count: number }>;
  fileSizeRanges: Array<{ 
    range: string; 
    min: number; 
    max: number | null; 
    count: number 
  }>;
  dateRanges: Array<{
    range: string;
    from: Date;
    to: Date;
    count: number;
  }>;
}

export interface SearchResponse {
  documents: DocumentSearchResult[];
  totalCount: number;
  facets: DocumentSearchFacets;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  isStarred: boolean;
}

const DEFAULT_FILTERS: SearchFilters = {
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
  limit: 25,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

export function useAdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [isSearchBuilderOpen, setIsSearchBuilderOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple search query (fallback to basic endpoint if advanced search fails)
  const { data: basicDocuments = [], isLoading: isLoadingBasic } = useQuery({
    queryKey: ["/api/client-documents"],
    enabled: !hasActiveSearch(filters) // Only use basic search when no advanced filters
  });

  // Advanced search query
  const { 
    data: searchResponse, 
    isLoading: isLoadingAdvanced, 
    error: searchError,
    refetch: refetchSearch 
  } = useQuery({
    queryKey: ["/api/client-documents/search", filters],
    queryFn: async () => {
      if (!hasActiveSearch(filters)) {
        return null;
      }
      
      const response = await apiRequest('/api/client-documents/search', {
        method: 'POST',
        body: JSON.stringify(filters)
      });
      return response as SearchResponse;
    },
    enabled: hasActiveSearch(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  // Get clients for filter options
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  // Derived values
  const isLoading = isLoadingBasic || isLoadingAdvanced;
  const hasActiveAdvancedSearch = hasActiveSearch(filters);
  
  const results = useMemo(() => {
    if (hasActiveAdvancedSearch && searchResponse) {
      return searchResponse.documents;
    }
    return basicDocuments.map((doc: any) => ({
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt)
    }));
  }, [hasActiveAdvancedSearch, searchResponse, basicDocuments]);

  const totalCount = useMemo(() => {
    if (hasActiveAdvancedSearch && searchResponse) {
      return searchResponse.totalCount;
    }
    return basicDocuments.length;
  }, [hasActiveAdvancedSearch, searchResponse, basicDocuments]);

  const facets = useMemo(() => {
    if (hasActiveAdvancedSearch && searchResponse) {
      return searchResponse.facets;
    }
    // Generate basic facets from basic documents
    return generateBasicFacets(basicDocuments, clients);
  }, [hasActiveAdvancedSearch, searchResponse, basicDocuments, clients]);

  // Available tags from current results
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    results.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [results]);

  // Helper function to check if there are active search criteria
  function hasActiveSearch(searchFilters: SearchFilters): boolean {
    return Boolean(
      searchFilters.query ||
      searchFilters.types.length > 0 ||
      searchFilters.statuses.length > 0 ||
      searchFilters.clientIds.length > 0 ||
      searchFilters.tags.length > 0 ||
      searchFilters.createdDateFrom ||
      searchFilters.createdDateTo ||
      searchFilters.updatedDateFrom ||
      searchFilters.updatedDateTo ||
      searchFilters.fileSizeMin ||
      searchFilters.fileSizeMax ||
      searchFilters.includeArchived ||
      searchFilters.fuzzySearch
    );
  }

  // Generate basic facets from documents
  function generateBasicFacets(documents: any[], clients: Client[]): DocumentSearchFacets {
    const typeFacets = new Map<string, number>();
    const statusFacets = new Map<string, number>();
    const clientFacets = new Map<string, { name: string; count: number }>();
    const tagFacets = new Map<string, number>();

    documents.forEach(doc => {
      // Type facets
      if (doc.type) {
        typeFacets.set(doc.type, (typeFacets.get(doc.type) || 0) + 1);
      }

      // Status facets
      if (doc.status) {
        statusFacets.set(doc.status, (statusFacets.get(doc.status) || 0) + 1);
      }

      // Client facets
      if (doc.clientId) {
        const client = clients.find(c => c.id === doc.clientId);
        if (client) {
          const existing = clientFacets.get(doc.clientId) || { name: client.name, count: 0 };
          clientFacets.set(doc.clientId, { ...existing, count: existing.count + 1 });
        }
      }

      // Tag facets
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach((tag: string) => {
          tagFacets.set(tag, (tagFacets.get(tag) || 0) + 1);
        });
      }
    });

    return {
      types: Array.from(typeFacets.entries()).map(([value, count]) => ({ value, count })),
      statuses: Array.from(statusFacets.entries()).map(([value, count]) => ({ value, count })),
      clients: Array.from(clientFacets.entries()).map(([id, { name, count }]) => ({ id, name, count })),
      tags: Array.from(tagFacets.entries()).map(([value, count]) => ({ value, count })),
      fileSizeRanges: [],
      dateRanges: []
    };
  }

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Quick search (simple query update)
  const quickSearch = useCallback((query: string) => {
    updateFilters({ query, page: 1 });
    
    // Add to search history
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  }, [updateFilters, searchHistory]);

  // Remove specific filter
  const removeFilter = useCallback((filterType: string, value?: string) => {
    switch (filterType) {
      case 'query':
        updateFilters({ query: '' });
        break;
      case 'types':
        updateFilters({ types: filters.types.filter(t => t !== value) });
        break;
      case 'statuses':
        updateFilters({ statuses: filters.statuses.filter(s => s !== value) });
        break;
      case 'clientIds':
        updateFilters({ clientIds: filters.clientIds.filter(c => c !== value) });
        break;
      case 'tags':
        updateFilters({ tags: filters.tags.filter(t => t !== value) });
        break;
      case 'createdDate':
        updateFilters({ createdDateFrom: undefined, createdDateTo: undefined });
        break;
      case 'updatedDate':
        updateFilters({ updatedDateFrom: undefined, updatedDateTo: undefined });
        break;
      case 'fileSize':
        updateFilters({ fileSizeMin: undefined, fileSizeMax: undefined });
        break;
      case 'includeArchived':
        updateFilters({ includeArchived: false });
        break;
      case 'fuzzySearch':
        updateFilters({ fuzzySearch: false });
        break;
    }
  }, [filters, updateFilters]);

  // Save search
  const saveSearch = useCallback((name: string, description?: string, isStarred: boolean = false) => {
    const newSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name,
      description,
      filters: { ...filters },
      createdAt: new Date(),
      usageCount: 0,
      isStarred
    };
    
    setSavedSearches(prev => [...prev, newSearch]);
    toast({ title: "Search saved successfully" });
  }, [filters, toast]);

  // Load saved search
  const loadSavedSearch = useCallback((searchId: string) => {
    const search = savedSearches.find(s => s.id === searchId);
    if (search) {
      setFilters(search.filters);
      
      // Update usage stats
      setSavedSearches(prev => 
        prev.map(s => 
          s.id === searchId 
            ? { ...s, lastUsed: new Date(), usageCount: s.usageCount + 1 }
            : s
        )
      );
      
      toast({ title: `Loaded search "${search.name}"` });
    }
  }, [savedSearches, toast]);

  // Delete saved search
  const deleteSavedSearch = useCallback((searchId: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== searchId));
    toast({ title: "Search deleted" });
  }, [toast]);

  // Star/unstar saved search
  const starSavedSearch = useCallback((searchId: string, isStarred: boolean) => {
    setSavedSearches(prev => 
      prev.map(s => 
        s.id === searchId ? { ...s, isStarred } : s
      )
    );
  }, []);

  // Refresh search results
  const refresh = useCallback(() => {
    if (hasActiveAdvancedSearch) {
      refetchSearch();
    } else {
      queryClient.invalidateQueries({ queryKey: ["/api/client-documents"] });
    }
  }, [hasActiveAdvancedSearch, refetchSearch, queryClient]);

  return {
    // State
    filters,
    isAdvancedModalOpen,
    isSearchBuilderOpen,
    searchHistory,
    savedSearches,
    
    // Data
    results,
    totalCount,
    facets,
    clients,
    availableTags,
    isLoading,
    searchError,
    hasActiveAdvancedSearch,
    
    // Actions
    updateFilters,
    resetFilters,
    quickSearch,
    removeFilter,
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch,
    starSavedSearch,
    refresh,
    
    // UI Controls
    setIsAdvancedModalOpen,
    setIsSearchBuilderOpen
  };
}