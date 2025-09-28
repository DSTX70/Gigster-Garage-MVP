import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TagManager } from "./TagManager";
import { MetadataEditor, MetadataField } from "./MetadataEditor";
import { CheckSquare, Archive, Trash2, Tag, Edit3, FolderOpen, Download } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ClientDocument } from "@shared/schema";
import type { VirtualFolder } from "./FolderManager";

interface BulkOperationsToolbarProps {
  selectedDocuments: string[];
  documents: ClientDocument[];
  availableTags: string[];
  folders: VirtualFolder[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkUpdate: () => void;
}

export function BulkOperationsToolbar({
  selectedDocuments,
  documents,
  availableTags,
  folders,
  onSelectAll,
  onDeselectAll,
  onBulkUpdate
}: BulkOperationsToolbarProps) {
  const [bulkOperation, setBulkOperation] = useState<string | null>(null);
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkFolder, setBulkFolder] = useState<string>("");
  const [bulkMetadata, setBulkMetadata] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const response = await fetch('/api/client-documents/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: selectedDocuments,
          updates: updateData
        })
      });
      if (!response.ok) throw new Error('Bulk update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-documents"] });
      toast({ title: "Documents updated successfully" });
      onBulkUpdate();
      setBulkOperation(null);
    },
    onError: () => {
      toast({
        title: "Failed to update documents",
        variant: "destructive"
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/client-documents/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: selectedDocuments })
      });
      if (!response.ok) throw new Error('Bulk delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-documents"] });
      toast({ title: "Documents deleted successfully" });
      onBulkUpdate();
    },
    onError: () => {
      toast({
        title: "Failed to delete documents",
        variant: "destructive"
      });
    }
  });

  const downloadSelectedMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/client-documents/bulk-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: selectedDocuments })
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({ title: "Documents downloaded successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to download documents",
        variant: "destructive"
      });
    }
  });

  const selectedDocumentDetails = documents.filter(doc => 
    selectedDocuments.includes(doc.id)
  );

  const handleBulkTags = () => {
    bulkUpdateMutation.mutate({ tags: bulkTags });
  };

  const handleBulkStatus = () => {
    if (!bulkStatus) return;
    bulkUpdateMutation.mutate({ status: bulkStatus });
  };

  const handleBulkFolder = () => {
    const folderMetadata = bulkFolder ? { folder: bulkFolder } : { folder: null };
    bulkUpdateMutation.mutate({ metadata: folderMetadata });
  };

  const handleBulkMetadata = () => {
    bulkUpdateMutation.mutate({ metadata: bulkMetadata });
  };

  if (selectedDocuments.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedDocuments.length === documents.length}
                onCheckedChange={(checked) => checked ? onSelectAll() : onDeselectAll()}
                data-testid="checkbox-select-all"
              />
              <span className="text-sm font-medium">
                {selectedDocuments.length} of {documents.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedDocumentDetails.slice(0, 3).map(doc => (
                <Badge key={doc.id} variant="secondary" className="text-xs">
                  {doc.name}
                </Badge>
              ))}
              {selectedDocuments.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedDocuments.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Download */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadSelectedMutation.mutate()}
              disabled={downloadSelectedMutation.isPending}
              data-testid="button-bulk-download"
            >
              <Download className="h-4 w-4 mr-1" />
              Download All
            </Button>

            {/* Bulk Tag Operations */}
            <Dialog open={bulkOperation === 'tags'} onOpenChange={(open) => setBulkOperation(open ? 'tags' : null)}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-bulk-tags"
                >
                  <Tag className="h-4 w-4 mr-1" />
                  Tags
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-bulk-tags">
                <DialogHeader>
                  <DialogTitle>Manage Tags for {selectedDocuments.length} documents</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <TagManager
                    availableTags={availableTags}
                    selectedTags={bulkTags}
                    onTagsChange={setBulkTags}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkTags}
                      disabled={bulkUpdateMutation.isPending}
                      data-testid="button-apply-bulk-tags"
                    >
                      Apply Tags
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setBulkOperation(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Status Updates */}
            <Dialog open={bulkOperation === 'status'} onOpenChange={(open) => setBulkOperation(open ? 'status' : null)}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-bulk-status"
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Status
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-bulk-status">
                <DialogHeader>
                  <DialogTitle>Update Status for {selectedDocuments.length} documents</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger data-testid="select-bulk-status">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkStatus}
                      disabled={!bulkStatus || bulkUpdateMutation.isPending}
                      data-testid="button-apply-bulk-status"
                    >
                      Update Status
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setBulkOperation(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Folder Move */}
            <Dialog open={bulkOperation === 'folder'} onOpenChange={(open) => setBulkOperation(open ? 'folder' : null)}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-bulk-folder"
                >
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Move
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-bulk-folder">
                <DialogHeader>
                  <DialogTitle>Move {selectedDocuments.length} documents to folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={bulkFolder} onValueChange={setBulkFolder}>
                    <SelectTrigger data-testid="select-bulk-folder">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Folder</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkFolder}
                      disabled={bulkUpdateMutation.isPending}
                      data-testid="button-apply-bulk-folder"
                    >
                      Move Documents
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setBulkOperation(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Metadata */}
            <Dialog open={bulkOperation === 'metadata'} onOpenChange={(open) => setBulkOperation(open ? 'metadata' : null)}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-bulk-metadata"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Fields
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="dialog-bulk-metadata">
                <DialogHeader>
                  <DialogTitle>Update Fields for {selectedDocuments.length} documents</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <MetadataEditor
                    metadata={bulkMetadata}
                    onMetadataChange={setBulkMetadata}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkMetadata}
                      disabled={bulkUpdateMutation.isPending}
                      data-testid="button-apply-bulk-metadata"
                    >
                      Update Fields
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setBulkOperation(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  data-testid="button-bulk-delete"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Documents</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedDocuments.length} selected documents? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => bulkDeleteMutation.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={bulkDeleteMutation.isPending}
                  >
                    Delete Documents
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDeselectAll}
              data-testid="button-clear-selection"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}