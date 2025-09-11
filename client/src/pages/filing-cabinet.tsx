import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FolderOpen, FileText, File, Download, Search, Calendar, User, Building, Filter, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import type { ClientDocument, Client, Project } from "@shared/schema";

interface FilingCabinetDocument extends ClientDocument {
  client?: Client;
  project?: Project;
  uploadedBy?: { name: string; email: string };
}

export default function FilingCabinet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const { data: documents = [], isLoading } = useQuery<FilingCabinetDocument[]>({
    queryKey: ["/api/client-documents"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === "" || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesClient = clientFilter === "all" || doc.clientId === clientFilter;

    return matchesSearch && matchesType && matchesClient;
  });

  // Group documents by type for stats
  const documentStats = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getFileIcon = (type: string, mimeType?: string) => {
    if (mimeType?.startsWith('image/')) {
      return <File className="h-5 w-5 text-blue-500" />;
    }
    if (mimeType?.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    switch (type) {
      case 'proposal':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'invoice':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'contract':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'presentation':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
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
              {documents.length} files
            </Badge>
          </div>
          <p className="text-gray-600">Organize and access all your saved files and documents</p>
        </div>

        {/* Document Type Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {Object.entries(documentStats).map(([type, count]) => (
            <Card key={type} className="text-center">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files, clients, or descriptions..."
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

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setClientFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

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
                {searchQuery || typeFilter !== "all" || clientFilter !== "all" 
                  ? "No files match your filters" 
                  : "No files found"
                }
              </h3>
              <p className="text-gray-600">
                {searchQuery || typeFilter !== "all" || clientFilter !== "all"
                  ? "Try adjusting your search criteria or clearing filters"
                  : "Files will appear here as they are uploaded and saved"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getFileIcon(document.type, document.mimeType || undefined)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {document.name}
                          </h3>
                          <Badge className={getTypeColor(document.type)}>
                            {document.type}
                          </Badge>
                          {document.status !== 'active' && (
                            <Badge variant="outline">
                              {document.status}
                            </Badge>
                          )}
                        </div>
                        
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
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {document.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}