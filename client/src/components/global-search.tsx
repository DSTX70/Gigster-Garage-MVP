import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, FileText, Users, Folder, Clock, Mail, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "task" | "project" | "client" | "invoice" | "message";
  title: string;
  description?: string;
  url: string;
  metadata?: {
    status?: string;
    priority?: string;
    dueDate?: string;
    projectName?: string;
    assigneeName?: string;
  };
}

interface GlobalSearchProps {
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

const getIconForType = (type: SearchResult["type"]) => {
  switch (type) {
    case "task":
      return <Clock className="h-4 w-4 text-blue-600" />;
    case "project":
      return <Folder className="h-4 w-4 text-purple-600" />;
    case "client":
      return <Users className="h-4 w-4 text-green-600" />;
    case "invoice":
      return <FileText className="h-4 w-4 text-orange-600" />;
    case "message":
      return <Mail className="h-4 w-4 text-blue-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const getTypeLabel = (type: SearchResult["type"]) => {
  switch (type) {
    case "task":
      return "Task";
    case "project":
      return "Project";
    case "client":
      return "Client";
    case "invoice":
      return "Invoice";
    case "message":
      return "Message";
    default:
      return "Item";
  }
};

export function GlobalSearch({ className, onClose, autoFocus = false }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Search API call with debouncing
  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", query],
    enabled: query.length >= 2,
    staleTime: 30000, // Cache results for 30 seconds
  });

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, results, selectedIndex]);

  // Global keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.length >= 2);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
    onClose?.();
  };

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<SearchResult["type"], SearchResult[]>);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search tasks, projects, clients... (Ctrl+K)"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-10 pr-10 bg-white border-gray-300 focus:border-blue-500"
          data-testid="global-search-input"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            data-testid="clear-search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-hidden z-50 shadow-lg border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Searching...
              </div>
            ) : results.length === 0 && query.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                No results found for "{query}"
              </div>
            ) : (
              <div ref={resultsRef} className="max-h-80 overflow-y-auto">
                {Object.entries(groupedResults).map(([type, typeResults], groupIndex) => (
                  <div key={type}>
                    {groupIndex > 0 && <Separator />}
                    <div className="p-2 bg-gray-50 border-b">
                      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {getTypeLabel(type as SearchResult["type"])}s ({typeResults.length})
                      </h4>
                    </div>
                    {typeResults.map((result, index) => {
                      const globalIndex = Object.entries(groupedResults)
                        .slice(0, groupIndex)
                        .reduce((acc, [, items]) => acc + items.length, 0) + index;
                      
                      return (
                        <div
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className={cn(
                            "flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors",
                            selectedIndex === globalIndex && "bg-blue-50"
                          )}
                          data-testid={`search-result-${result.type}-${result.id}`}
                        >
                          {getIconForType(result.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 truncate">
                                {result.title}
                              </span>
                              {result.metadata?.status && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.metadata.status}
                                </Badge>
                              )}
                              {result.metadata?.priority === "high" && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  High Priority
                                </Badge>
                              )}
                            </div>
                            {result.description && (
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {result.description}
                              </p>
                            )}
                            {(result.metadata?.projectName || result.metadata?.assigneeName || result.metadata?.dueDate) && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                {result.metadata.projectName && (
                                  <span>Project: {result.metadata.projectName}</span>
                                )}
                                {result.metadata.assigneeName && (
                                  <span>Assigned to: {result.metadata.assigneeName}</span>
                                )}
                                {result.metadata.dueDate && (
                                  <span>Due: {new Date(result.metadata.dueDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
            {query.length >= 2 && results.length > 0 && (
              <div className="p-2 bg-gray-50 border-t text-xs text-gray-500 text-center">
                Use ↑↓ to navigate, Enter to select, Esc to close
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={handleClose}
        />
      )}
    </div>
  );
}