import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ObjectUploader } from "./ObjectUploader";
import { FileText, Upload, Download, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ClientDocument } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ClientDocumentsProps {
  clientId: string;
}

export function ClientDocuments({ clientId }: ClientDocumentsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "",
    filePath: ""
  });

  // Fetch client documents
  const { data: documents = [], isLoading } = useQuery<ClientDocument[]>({
    queryKey: ['/api/clients', clientId, 'documents'],
    queryFn: () => apiRequest(`/api/clients/${clientId}/documents`).then(res => res.json())
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => 
      apiRequest(`/api/documents/${documentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'documents'] });
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest(`/api/clients/${clientId}/documents`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'documents'] });
      setIsUploadModalOpen(false);
      setUploadForm({ name: "", description: "", category: "", filePath: "" });
      toast({
        title: "Document uploaded",
        description: "The document has been successfully uploaded.",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest('/api/documents/upload', { method: 'POST' });
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      setUploadForm(prev => ({
        ...prev,
        filePath: uploadedFile.uploadURL,
        name: prev.name || uploadedFile.name || "Untitled Document"
      }));
    }
  };

  const handleSubmitDocument = () => {
    if (!uploadForm.name || !uploadForm.filePath) {
      toast({
        title: "Error",
        description: "Please provide a document name and upload a file.",
        variant: "destructive",
      });
      return;
    }

    uploadDocumentMutation.mutate(uploadForm);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents ({documents.length})
          </CardTitle>
          
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-document">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input
                    id="document-name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter document name"
                    data-testid="input-document-name"
                  />
                </div>
                <div>
                  <Label htmlFor="document-category">Category</Label>
                  <Input
                    id="document-category"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Contract, Invoice, Report"
                    data-testid="input-document-category"
                  />
                </div>
                <div>
                  <Label htmlFor="document-description">Description</Label>
                  <Textarea
                    id="document-description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the document"
                    data-testid="input-document-description"
                  />
                </div>
                <div>
                  <Label>File Upload</Label>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={50 * 1024 * 1024} // 50MB
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadForm.filePath ? "File Selected - Click to Change" : "Choose File"}
                  </ObjectUploader>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitDocument}
                    disabled={uploadDocumentMutation.isPending || !uploadForm.name || !uploadForm.filePath}
                    className="flex-1"
                    data-testid="button-save-document"
                  >
                    {uploadDocumentMutation.isPending ? "Saving..." : "Save Document"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploadModalOpen(false)}
                    data-testid="button-cancel-upload"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Click "Upload Document" to add the first document</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50"
                data-testid={`card-document-${document.id}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium" data-testid={`text-document-name-${document.id}`}>
                      {document.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {document.category && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                          {document.category}
                        </span>
                      )}
                      {document.fileSize && (
                        <span>{formatFileSize(document.fileSize)}</span>
                      )}
                      <span>{formatDate(document.createdAt)}</span>
                    </div>
                    {document.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {document.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {document.filePath && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(document.filePath, '_blank')}
                      data-testid={`button-view-document-${document.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteDocumentMutation.mutate(document.id)}
                    disabled={deleteDocumentMutation.isPending}
                    data-testid={`button-delete-document-${document.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}