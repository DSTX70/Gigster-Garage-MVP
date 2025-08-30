import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Download, FileText, Image, Video, Archive, File, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FileAttachment } from "@shared/schema";

interface FileAttachmentsProps {
  entityType: 'task' | 'project' | 'client';
  entityId: string;
  title?: string;
  className?: string;
  showUpload?: boolean;
}

export function FileAttachments({ 
  entityType, 
  entityId, 
  title = "File Attachments", 
  className = "",
  showUpload = true 
}: FileAttachmentsProps) {
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const { toast } = useToast();

  // Fetch file attachments
  const { data: attachments = [], isLoading, error } = useQuery<FileAttachment[]>({
    queryKey: ['/api/attachments', entityType, entityId],
  });

  // Upload mutation to create file attachment record
  const createAttachmentMutation = useMutation({
    mutationFn: async (attachmentData: any) => {
      return apiRequest(`/api/attachments`, {
        method: 'POST',
        body: JSON.stringify(attachmentData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attachments'] });
      toast({
        title: "File uploaded successfully",
        description: "Your file has been attached.",
      });
      setUploadDescription("");
      setUploadTags("");
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      return apiRequest(`/api/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attachments'] });
      toast({
        title: "File deleted",
        description: "The file attachment has been removed.",
      });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    }
  });

  // Get upload parameters
  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest('/api/attachments/upload', {
        method: 'POST'
      });
      return {
        method: 'PUT' as const,
        url: response.uploadURL
      };
    } catch (error) {
      console.error('Failed to get upload parameters:', error);
      throw error;
    }
  };

  // Handle upload completion
  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      
      const attachmentData = {
        fileName: uploadedFile.name,
        originalName: uploadedFile.name,
        filePath: uploadedFile.uploadURL,
        fileSize: uploadedFile.size || null,
        mimeType: uploadedFile.type || null,
        entityType,
        entityId,
        description: uploadDescription || null,
        isPublic: false,
        tags: uploadTags ? uploadTags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      createAttachmentMutation.mutate(attachmentData);
    }
  };

  // Get file icon based on MIME type
  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="w-4 h-4" />;
    
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="w-4 h-4" />;
    }
    if (mimeType.includes('zip') || mimeType.includes('archive')) {
      return <Archive className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading attachments...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg text-red-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">Failed to load attachments</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <Badge variant="secondary">{attachments.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        {showUpload && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Description (optional)"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated, optional)"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={50 * 1024 * 1024} // 50MB
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="w-full"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload Files</span>
              </div>
            </ObjectUploader>
          </div>
        )}

        {/* Attachments List */}
        {attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No files attached yet</p>
            {showUpload && <p className="text-sm">Upload files to get started</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment, index) => (
              <div key={attachment.id}>
                <div className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1">
                      {getFileIcon(attachment.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" title={attachment.fileName}>
                        {attachment.originalName || attachment.fileName}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{formatFileSize(attachment.fileSize)}</div>
                        {attachment.description && (
                          <div className="italic">{attachment.description}</div>
                        )}
                        {attachment.tags && attachment.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {attachment.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-xs">
                          Uploaded {new Date(attachment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/objects/${attachment.filePath.replace(/^\/objects\//, '')}`, '_blank')}
                      data-testid={`button-download-${attachment.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(attachment.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${attachment.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {index < attachments.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}