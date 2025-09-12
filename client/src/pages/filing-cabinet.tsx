import { useState, useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { FolderOpen, FileText, File, Download, Search, Calendar, User, Building, Filter, ArrowLeft, Grid, List, MoreVertical, Edit2, Trash2, Tag, Folder, Settings, Menu, Archive, Star, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Import our enhanced components
import { TagManager } from "@/components/TagManager";
import { TagCloud } from "@/components/TagCloud";
import { FolderManager, VirtualFolder } from "@/components/FolderManager";
import { MetadataEditor } from "@/components/MetadataEditor";
import { BulkOperationsToolbar } from "@/components/BulkOperationsToolbar";

import type { ClientDocument, Client } from "@shared/schema";

interface EnhancedFilingCabinetDocument extends ClientDocument {
  client?: Client;
  uploadedBy?: { name: string; email: string };
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'type' | 'size';

export default function FilingCabinet() {
  // Basic state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  
  // UI state  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [editingDocument, setEditingDocument] = useState<EnhancedFilingCabinetDocument | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: documents = [], isLoading } = useQuery<EnhancedFilingCabinetDocument[]>({
    queryKey: ["/api/client-documents"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Virtual folders state (stored in component state for demo - would be persisted in real app)
  const [virtualFolders, setVirtualFolders] = useState<VirtualFolder[]>([
    { id: 'recent', name: 'Recent Files', documentCount: 0 },
    { id: 'favorites', name: 'Favorites', documentCount: 0 },
    { id: 'archived', name: 'Archived', documentCount: 0 }
  ]);

  // Derived data
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    documents.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [documents]);

  const foldersWithCounts = useMemo(() => {
    return virtualFolders.map(folder => ({
      ...folder,
      documentCount: documents.filter(doc => 
        doc.metadata?.folder === folder.id
      ).length
    }));
  }, [virtualFolders, documents]);

  // Filtering and sorting
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Basic filters
      const matchesType = typeFilter === "all" || doc.type === typeFilter;
      const matchesClient = clientFilter === "all" || doc.clientId === clientFilter;
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

      // Tag filter
      const matchesTags = tagFilter.length === 0 || 
        (doc.tags && Array.isArray(doc.tags) && 
         tagFilter.every(tag => doc.tags!.includes(tag)));

      // Folder filter
      const matchesFolder = folderFilter === null || doc.metadata?.folder === folderFilter;

      return matchesSearch && matchesType && matchesClient && matchesStatus && matchesTags && matchesFolder;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'size':
          return (b.fileSize || 0) - (a.fileSize || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, typeFilter, clientFilter, statusFilter, tagFilter, folderFilter, sortBy]);

  // Document stats
  const documentStats = useMemo(() => {
    return documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [documents]);

  // Mutations
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const response = await fetch(`/api/client-documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-documents"] });
      toast({ title: "Document updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update document", variant: "destructive" });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/client-documents/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-documents"] });
      toast({ title: "Document deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete document", variant: "destructive" });
    }
  });

  // Event handlers
  const handleDocumentSelect = (documentId: string, selected: boolean) => {
    if (selected) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const handleSelectAll = () => {
    setSelectedDocuments(filteredDocuments.map(doc => doc.id));
  };

  const handleDeselectAll = () => {
    setSelectedDocuments([]);
  };

  const handleBulkUpdate = () => {
    setSelectedDocuments([]);
  };

  const handleFolderCreate = (name: string, description?: string) => {
    const newFolder: VirtualFolder = {
      id: `folder-${Date.now()}`,
      name,
      description,
      documentCount: 0
    };
    setVirtualFolders(prev => [...prev, newFolder]);
  };

  const handleFolderUpdate = (folderId: string, name: string, description?: string) => {
    setVirtualFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name, description }
          : folder
      )
    );
  };

  const handleFolderDelete = (folderId: string) => {
    setVirtualFolders(prev => prev.filter(folder => folder.id !== folderId));
    // Move documents back to "no folder"
    documents
      .filter(doc => doc.metadata?.folder === folderId)
      .forEach(doc => {
        updateDocumentMutation.mutate({
          id: doc.id,
          updates: { 
            metadata: { ...doc.metadata, folder: null }
          }
        });
      });
  };

  const handleMoveDocumentToFolder = (documentId: string, folderId: string | null) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    updateDocumentMutation.mutate({
      id: documentId,
      updates: {
        metadata: { ...document.metadata, folder: folderId }
      }
    });
  };

  // Utility functions
  const getFileIcon = (type: string, mimeType?: string) => {
    if (mimeType?.startsWith('image/')) {
      return <File className="h-5 w-5 text-blue-500" />;
    }
    if (mimeType?.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    switch (type) {
      case 'proposal': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'invoice': return <FileText className="h-5 w-5 text-green-500" />;
      case 'contract': return <FileText className="h-5 w-5 text-purple-500" />;
      case 'presentation': return <FileText className="h-5 w-5 text-orange-500" />;
      default: return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'proposal': return 'bg-blue-100 text-blue-800';
      case 'invoice': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'presentation': return 'bg-orange-100 text-orange-800';
      case 'report': return 'bg-amber-100 text-amber-800';
      case 'agreement': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderDocumentCard = (document: EnhancedFilingCabinetDocument) => (
    <Card 
      key={document.id} 
      className={`hover:shadow-lg transition-shadow ${
        selectedDocuments.includes(document.id) ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Checkbox
              checked={selectedDocuments.includes(document.id)}
              onCheckedChange={(checked) => handleDocumentSelect(document.id, checked as boolean)}
              data-testid={`checkbox-select-${document.id}`}
            />
            
            {getFileIcon(document.type, document.mimeType || undefined)}
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate">
                  {document.name}
                </h3>
                <Badge className={getTypeColor(document.type)}>
                  {document.type}
                </Badge>
                <Badge className={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
                {document.metadata?.folder && (
                  <Badge variant="outline">
                    <Folder className="h-3 w-3 mr-1" />
                    {foldersWithCounts.find(f => f.id === document.metadata?.folder)?.name}
                  </Badge>
                )}
              </div>
              
              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {document.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {document.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{document.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <File className="h-4 w-4" />
                  {document.fileName}
                </span>
                
                {document.client && (
                  <span className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <Link href={`/client/${document.clientId}`} className="hover:text-blue-600">
                      {document.client.name}
                    </Link>
                  </span>
                )}
                
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {document.uploadedBy?.name || 'Unknown'}
                </span>
                
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {document.createdAt ? format(new Date(document.createdAt), 'MMM d, yyyy') : '—'}
                </span>
              </div>
              
              {document.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {document.description}
                </p>
              )}
              
              {/* Custom Metadata Preview */}
              {document.metadata && Object.keys(document.metadata).filter(key => key !== 'folder').length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(document.metadata)
                    .filter(([key]) => key !== 'folder')
                    .slice(0, 2)
                    .map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key.replace(/_/g, ' ')}: {String(value)}
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right text-sm text-gray-600">
              <p>{formatFileSize(document.fileSize || undefined)}</p>
              <p>v{document.version}</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(document.fileUrl, '_blank')}
              data-testid={`button-download-${document.id}`}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>

            {/* Document Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-testid={`button-document-menu-${document.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingDocument(document)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Properties
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(document.fileUrl, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View/Preview
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Document
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{document.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteDocumentMutation.mutate(document.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      {/* Bulk Operations Toolbar */}
      <BulkOperationsToolbar
        selectedDocuments={selectedDocuments}
        documents={filteredDocuments}
        availableTags={allTags}
        folders={foldersWithCounts}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkUpdate={handleBulkUpdate}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-6 w-6 text-gray-600" />
              <h2 className="font-semibold text-lg">File Organization</h2>
            </div>

            {/* Folder Manager */}
            <FolderManager
              folders={foldersWithCounts}
              selectedFolder={folderFilter}
              onFolderSelect={setFolderFilter}
              onCreateFolder={handleFolderCreate}
              onUpdateFolder={handleFolderUpdate}
              onDeleteFolder={handleFolderDelete}
              onMoveDocumentToFolder={handleMoveDocumentToFolder}
            />

            {/* Tag Cloud */}
            <div className="border-t pt-6">
              <TagCloud
                tags={allTags}
                selectedTags={tagFilter}
                onTagSelect={(tag) => {
                  if (tagFilter.includes(tag)) {
                    setTagFilter(prev => prev.filter(t => t !== tag));
                  } else {
                    setTagFilter(prev => [...prev, tag]);
                  }
                }}
                onTagRemove={(tag) => {
                  setTagFilter(prev => prev.filter(t => t !== tag));
                }}
                onClearAll={() => setTagFilter([])}
              />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                File Organization
              </SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              <FolderManager
                folders={foldersWithCounts}
                selectedFolder={folderFilter}
                onFolderSelect={(folder) => {
                  setFolderFilter(folder);
                  setSidebarOpen(false);
                }}
                onCreateFolder={handleFolderCreate}
                onUpdateFolder={handleFolderUpdate}
                onDeleteFolder={handleFolderDelete}
                onMoveDocumentToFolder={handleMoveDocumentToFolder}
              />

              <div className="border-t pt-6">
                <TagCloud
                  tags={allTags}
                  selectedTags={tagFilter}
                  onTagSelect={(tag) => {
                    if (tagFilter.includes(tag)) {
                      setTagFilter(prev => prev.filter(t => t !== tag));
                    } else {
                      setTagFilter(prev => [...prev, tag]);
                    }
                    setSidebarOpen(false);
                  }}
                  onTagRemove={(tag) => {
                    setTagFilter(prev => prev.filter(t => t !== tag));
                  }}
                  onClearAll={() => {
                    setTagFilter([]);
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 max-w-none px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
                data-testid="button-open-sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <Link href="/">
                <Button variant="outline" size="sm" data-testid="button-back-to-dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              
              <div className="flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-gray-600" />
                <h1 className="text-3xl font-bold text-gray-900">Filing Cabinet</h1>
              </div>
              
              <Badge variant="secondary" className="text-sm">
                {filteredDocuments.length} files
              </Badge>
            </div>
            <p className="text-gray-600">Advanced file organization and management system</p>
          </div>

          {/* Document Type Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {Object.entries(documentStats).map(([type, count]) => (
              <Card 
                key={type} 
                className={`text-center cursor-pointer transition-colors ${
                  typeFilter === type ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    {getFileIcon(type)}
                    <p className="text-sm font-medium text-gray-900 mt-2 capitalize">{type}</p>
                    <p className="text-2xl font-bold text-gray-700">{count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files, clients, descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-files"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger data-testid="select-type-filter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="proposal">Proposals</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="contract">Contracts</SelectItem>
                    <SelectItem value="presentation">Presentations</SelectItem>
                    <SelectItem value="report">Reports</SelectItem>
                    <SelectItem value="agreement">Agreements</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger data-testid="select-client-filter">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setTypeFilter("all");
                      setClientFilter("all");
                      setStatusFilter("all");
                      setTagFilter([]);
                      setFolderFilter(null);
                    }}
                    data-testid="button-clear-filters"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    data-testid="button-view-grid"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Filters Display */}
          {(tagFilter.length > 0 || folderFilter) && (
            <div className="mb-6 flex flex-wrap gap-2">
              {folderFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  {foldersWithCounts.find(f => f.id === folderFilter)?.name}
                  <button
                    onClick={() => setFolderFilter(null)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {tagFilter.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    onClick={() => setTagFilter(prev => prev.filter(t => t !== tag))}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Document List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading files...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || typeFilter !== "all" || clientFilter !== "all" || statusFilter !== "all" || tagFilter.length > 0 || folderFilter
                    ? "No files match your filters" 
                    : "No files found"
                  }
                </h3>
                <p className="text-gray-600">
                  {searchQuery || typeFilter !== "all" || clientFilter !== "all" || statusFilter !== "all" || tagFilter.length > 0 || folderFilter
                    ? "Try adjusting your search criteria or clearing filters"
                    : "Files will appear here as they are uploaded and saved"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredDocuments.map(renderDocumentCard)}
            </div>
          )}
        </main>
      </div>

      {/* Edit Document Dialog */}
      <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-edit-document">
          <DialogHeader>
            <DialogTitle>Edit Document Properties</DialogTitle>
          </DialogHeader>
          {editingDocument && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Document Name</label>
                    <Input
                      value={editingDocument.name}
                      onChange={(e) => setEditingDocument(prev => prev ? {...prev, name: e.target.value} : null)}
                      data-testid="input-document-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={editingDocument.description || ''}
                      onChange={(e) => setEditingDocument(prev => prev ? {...prev, description: e.target.value} : null)}
                      data-testid="input-document-description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select 
                      value={editingDocument.status} 
                      onValueChange={(value) => setEditingDocument(prev => prev ? {...prev, status: value as any} : null)}
                    >
                      <SelectTrigger data-testid="select-document-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <TagManager
                  availableTags={allTags}
                  selectedTags={editingDocument.tags || []}
                  onTagsChange={(tags) => setEditingDocument(prev => prev ? {...prev, tags} : null)}
                  documentId={editingDocument.id}
                />
              </div>

              <div>
                <MetadataEditor
                  documentId={editingDocument.id}
                  metadata={editingDocument.metadata || {}}
                  onMetadataChange={(metadata) => setEditingDocument(prev => prev ? {...prev, metadata} : null)}
                  documentType={editingDocument.type}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (editingDocument) {
                      updateDocumentMutation.mutate({
                        id: editingDocument.id,
                        updates: {
                          name: editingDocument.name,
                          description: editingDocument.description,
                          status: editingDocument.status,
                          tags: editingDocument.tags,
                          metadata: editingDocument.metadata
                        }
                      });
                      setEditingDocument(null);
                    }
                  }}
                  data-testid="button-save-document"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingDocument(null)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}