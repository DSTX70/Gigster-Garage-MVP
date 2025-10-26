import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CheckSquare, Square, Download, Upload, Trash2, Edit3, Copy, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsProps<T> {
  entityType: 'tasks' | 'projects' | 'clients';
  items: T[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onRefresh: () => void;
  className?: string;
}

interface BulkEditData {
  status?: string;
  priority?: string;
  assignedToId?: string;
  projectId?: string;
  description?: string;
  dueDate?: string;
  tags?: string[];
}

interface BatchProgress {
  total: number;
  completed: number;
  errors: number;
  status: 'running' | 'completed' | 'error';
}

export function BulkActions<T extends { id: string }>({ 
  entityType, 
  items, 
  selectedItems, 
  onSelectionChange, 
  onRefresh,
  className = "" 
}: BulkActionsProps<T>) {
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [bulkEditData, setBulkEditData] = useState<BulkEditData>({});
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const { toast } = useToast();

  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < items.length;

  // Toggle all selection
  const handleToggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      setBatchProgress({ total: ids.length, completed: 0, errors: 0, status: 'running' });
      
      return apiRequest(`/api/bulk/${entityType}/delete`, {
        method: 'POST',
        body: JSON.stringify({ ids })
      });
    },
    onSuccess: (data) => {
      setBatchProgress({ ...data, status: 'completed' });
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}`] });
      onSelectionChange([]);
      onRefresh();
      toast({
        title: "Bulk delete completed",
        description: `${data.completed} items deleted successfully`,
      });
    },
    onError: (error: any) => {
      setBatchProgress(prev => prev ? { ...prev, status: 'error' } : null);
      toast({
        title: "Bulk delete failed",
        description: error.message || "Failed to delete items",
        variant: "destructive",
      });
    }
  });

  // Bulk edit mutation
  const bulkEditMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[], updates: BulkEditData }) => {
      setBatchProgress({ total: ids.length, completed: 0, errors: 0, status: 'running' });
      
      return apiRequest(`/api/bulk/${entityType}/edit`, {
        method: 'POST',
        body: JSON.stringify({ ids, updates })
      });
    },
    onSuccess: (data) => {
      setBatchProgress({ ...data, status: 'completed' });
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}`] });
      onSelectionChange([]);
      onRefresh();
      setShowBulkEdit(false);
      setBulkEditData({});
      toast({
        title: "Bulk edit completed",
        description: `${data.completed} items updated successfully`,
      });
    },
    onError: (error: any) => {
      setBatchProgress(prev => prev ? { ...prev, status: 'error' } : null);
      toast({
        title: "Bulk edit failed",
        description: error.message || "Failed to update items",
        variant: "destructive",
      });
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ format, ids }: { format: 'csv' | 'json', ids?: string[] }) => {
      const response = await fetch(`/api/export/${entityType}?format=${format}${ids ? `&ids=${ids.join(',')}` : ''}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${entityType}_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    },
    onSuccess: () => {
      setShowExport(false);
      toast({
        title: "Export completed",
        description: "Data exported successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    }
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/import/${entityType}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setBatchProgress({ ...data, status: 'completed' });
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}`] });
      onRefresh();
      setShowImport(false);
      setImportFile(null);
      toast({
        title: "Import completed",
        description: `${data.completed} items imported successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import data",
        variant: "destructive",
      });
    }
  });

  // Handle bulk edit
  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return;
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(bulkEditData).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    if (Object.keys(cleanUpdates).length === 0) {
      toast({
        title: "No changes",
        description: "Please make at least one change to update items",
        variant: "destructive",
      });
      return;
    }
    
    bulkEditMutation.mutate({ ids: selectedItems, updates: cleanUpdates });
  };

  // Close progress dialog
  useEffect(() => {
    if (batchProgress?.status === 'completed') {
      const timer = setTimeout(() => {
        setBatchProgress(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [batchProgress?.status]);

  if (selectedItems.length === 0 && !showExport && !showImport) {
    return null;
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleAll}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                data-testid="button-toggle-all"
              >
                {allSelected ? (
                  <CheckSquare className="w-5 h-5" />
                ) : someSelected ? (
                  <div className="w-5 h-5 border-2 border-primary bg-primary/20 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-sm" />
                  </div>
                ) : (
                  <Square className="w-5 h-5" />
                )}
                {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select All'}
              </button>
              {selectedItems.length > 0 && (
                <Badge variant="secondary">{selectedItems.length} items</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExport(true)}
                data-testid="button-export"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImport(true)}
                data-testid="button-import"
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {selectedItems.length > 0 && (
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkEdit(true)}
                data-testid="button-bulk-edit"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                data-testid="button-bulk-delete"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectionChange([])}
                data-testid="button-clear-selection"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit {selectedItems.length} Items</DialogTitle>
            <DialogDescription>
              Only fill in the fields you want to update. Empty fields will be ignored.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {entityType === 'tasks' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setBulkEditData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select onValueChange={(value) => setBulkEditData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    type="datetime-local"
                    onChange={(e) => setBulkEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                placeholder="Update description..."
                value={bulkEditData.description || ''}
                onChange={(e) => setBulkEditData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkEdit(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkEdit}
              disabled={bulkEditMutation.isPending}
              data-testid="button-confirm-bulk-edit"
            >
              Update {selectedItems.length} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedItems.length} selected items? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                bulkDeleteMutation.mutate(selectedItems);
                setShowDeleteConfirm(false);
              }}
              disabled={bulkDeleteMutation.isPending}
              data-testid="button-confirm-bulk-delete"
            >
              Delete {selectedItems.length} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Export {selectedItems.length > 0 ? `${selectedItems.length} selected items` : 'all items'} to file
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                  <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExport(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => exportMutation.mutate({ 
                format: exportFormat, 
                ids: selectedItems.length > 0 ? selectedItems : undefined 
              })}
              disabled={exportMutation.isPending}
              data-testid="button-confirm-export"
            >
              <Download className="w-4 h-4 mr-2" />
              Export {exportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import {entityType}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              {importFile && (
                <div className="text-sm text-muted-foreground">
                  Selected: {importFile.name} ({Math.round(importFile.size / 1024)}KB)
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => importFile && importMutation.mutate(importFile)}
              disabled={!importFile || importMutation.isPending}
              data-testid="button-confirm-import"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={!!batchProgress} onOpenChange={() => setBatchProgress(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {batchProgress?.status === 'running' && 'Processing...'}
              {batchProgress?.status === 'completed' && 'Operation Completed'}
              {batchProgress?.status === 'error' && 'Operation Failed'}
            </DialogTitle>
            <DialogDescription>
              {batchProgress?.status === 'running' && 'Please wait while we process your request'}
              {batchProgress?.status === 'completed' && 'The batch operation has been completed successfully'}
              {batchProgress?.status === 'error' && 'The batch operation encountered errors'}
            </DialogDescription>
          </DialogHeader>
          
          {batchProgress && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{batchProgress.completed} / {batchProgress.total}</span>
                </div>
                <Progress value={(batchProgress.completed / batchProgress.total) * 100} />
              </div>
              
              {batchProgress.errors > 0 && (
                <div className="text-sm text-red-600">
                  {batchProgress.errors} errors occurred during processing
                </div>
              )}
            </div>
          )}

          {batchProgress?.status !== 'running' && (
            <DialogFooter>
              <Button onClick={() => setBatchProgress(null)}>
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}