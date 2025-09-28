import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { FolderPlus, Folder, FolderOpen, MoreVertical, Edit2, Trash2, FolderTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface VirtualFolder {
  id: string;
  name: string;
  color?: string;
  description?: string;
  documentCount?: number;
}

interface FolderManagerProps {
  folders: VirtualFolder[];
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onCreateFolder: (name: string, description?: string) => void;
  onUpdateFolder: (folderId: string, name: string, description?: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveDocumentToFolder: (documentId: string, folderId: string | null) => void;
}

const FOLDER_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800', 
  'bg-yellow-100 text-yellow-800',
  'bg-red-100 text-red-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-gray-100 text-gray-800'
];

export function FolderManager({ 
  folders, 
  selectedFolder, 
  onFolderSelect, 
  onCreateFolder, 
  onUpdateFolder, 
  onDeleteFolder,
  onMoveDocumentToFolder 
}: FolderManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<VirtualFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const { toast } = useToast();

  const getFolderColor = (folderId: string) => {
    const hash = folderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FOLDER_COLORS[hash % FOLDER_COLORS.length];
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({ title: "Please enter a folder name", variant: "destructive" });
      return;
    }
    
    onCreateFolder(newFolderName.trim(), newFolderDescription.trim() || undefined);
    setNewFolderName("");
    setNewFolderDescription("");
    setIsCreateOpen(false);
    toast({ title: "Folder created successfully" });
  };

  const handleUpdateFolder = () => {
    if (!editingFolder || !newFolderName.trim()) {
      toast({ title: "Please enter a folder name", variant: "destructive" });
      return;
    }

    onUpdateFolder(editingFolder.id, newFolderName.trim(), newFolderDescription.trim() || undefined);
    setEditingFolder(null);
    setNewFolderName("");
    setNewFolderDescription("");
    toast({ title: "Folder updated successfully" });
  };

  const handleDeleteFolder = (folderId: string) => {
    onDeleteFolder(folderId);
    if (selectedFolder === folderId) {
      onFolderSelect(null);
    }
    toast({ title: "Folder deleted successfully" });
  };

  const startEdit = (folder: VirtualFolder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderDescription(folder.description || "");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <FolderTree className="h-4 w-4" />
          Folders
        </h3>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-create-folder"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-folder">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Folder Name</label>
                <Input
                  placeholder="Enter folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  data-testid="input-folder-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <Input
                  placeholder="Enter folder description..."
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  data-testid="input-folder-description"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateFolder} data-testid="button-confirm-create-folder">
                  Create Folder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  data-testid="button-cancel-create-folder"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* All Files (No Folder) */}
      <div
        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
          selectedFolder === null ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
        }`}
        onClick={() => onFolderSelect(null)}
        data-testid="folder-all-files"
      >
        <FolderOpen className="h-4 w-4" />
        <span className="flex-1">All Files</span>
      </div>

      {/* Virtual Folders */}
      <div className="space-y-1">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors group ${
              selectedFolder === folder.id ? getFolderColor(folder.id) : 'hover:bg-gray-100'
            }`}
            onClick={() => onFolderSelect(folder.id)}
            data-testid={`folder-${folder.id}`}
          >
            <Folder className="h-4 w-4" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate">{folder.name}</span>
                {folder.documentCount !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {folder.documentCount}
                  </Badge>
                )}
              </div>
              {folder.description && (
                <p className="text-xs text-gray-500 truncate">{folder.description}</p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  data-testid={`button-folder-menu-${folder.id}`}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => startEdit(folder)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Folder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Folder
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{folder.name}"? Documents in this folder will be moved to "All Files".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteFolder(folder.id)}
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
        ))}
      </div>

      {/* Edit Folder Dialog */}
      <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
        <DialogContent data-testid="dialog-edit-folder">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Folder Name</label>
              <Input
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateFolder()}
                data-testid="input-edit-folder-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Input
                placeholder="Enter folder description..."
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                data-testid="input-edit-folder-description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateFolder} data-testid="button-confirm-edit-folder">
                Update Folder
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingFolder(null)}
                data-testid="button-cancel-edit-folder"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {folders.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No folders created yet
        </div>
      )}
    </div>
  );
}