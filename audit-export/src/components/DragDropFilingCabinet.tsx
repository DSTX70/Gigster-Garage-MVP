import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, File, Folder, Tag } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ClientDocument } from "@shared/schema";
import type { VirtualFolder } from "./FolderManager";

interface DragDropFilingCabinetProps {
  children: React.ReactNode;
  documents: (ClientDocument & { client?: any; uploadedBy?: any })[];
  folders: VirtualFolder[];
  onDocumentUpdate: () => void;
}

export function DragDropFilingCabinet({ 
  children, 
  documents, 
  folders, 
  onDocumentUpdate 
}: DragDropFilingCabinetProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedDocument, setDraggedDocument] = useState<ClientDocument | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      onDocumentUpdate();
      toast({ title: "Document updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update document", variant: "destructive" });
    }
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const document = documents.find(doc => doc.id === active.id);
    if (document) {
      setDraggedDocument(document);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedDocument) {
      setActiveId(null);
      setDraggedDocument(null);
      return;
    }

    const documentId = active.id as string;
    const dropTargetId = over.id as string;

    // Handle different drop targets
    if (dropTargetId.startsWith('folder-')) {
      // Dropped on a folder
      const folderId = dropTargetId === 'folder-all' ? null : dropTargetId.replace('folder-', '');
      const folderName = folderId 
        ? folders.find(f => f.id === folderId)?.name || 'Unknown Folder'
        : 'All Files';
      
      updateDocumentMutation.mutate({
        id: documentId,
        updates: {
          metadata: { 
            ...draggedDocument.metadata, 
            folder: folderId 
          }
        }
      });
      
      toast({ title: `Moved to ${folderName}` });
    } 
    else if (dropTargetId.startsWith('status-')) {
      // Dropped on a status zone
      const newStatus = dropTargetId.replace('status-', '');
      updateDocumentMutation.mutate({
        id: documentId,
        updates: { status: newStatus }
      });
      
      toast({ title: `Status changed to ${newStatus}` });
    }
    else if (dropTargetId.startsWith('tag-')) {
      // Dropped on a tag
      const tagName = dropTargetId.replace('tag-', '');
      const currentTags = draggedDocument.tags || [];
      
      if (!currentTags.includes(tagName)) {
        updateDocumentMutation.mutate({
          id: documentId,
          updates: { tags: [...currentTags, tagName] }
        });
        
        toast({ title: `Added tag: ${tagName}` });
      }
    }

    setActiveId(null);
    setDraggedDocument(null);
  };

  const getFileIcon = (type: string, mimeType?: string) => {
    if (mimeType?.startsWith('image/')) {
      return <File className="h-4 w-4 text-blue-500" />;
    }
    if (mimeType?.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    switch (type) {
      case 'proposal': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'invoice': return <FileText className="h-4 w-4 text-green-500" />;
      case 'contract': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'presentation': return <FileText className="h-4 w-4 text-orange-500" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      <DragOverlay>
        {activeId && draggedDocument ? (
          <Card className="w-80 opacity-90 rotate-6 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {getFileIcon(draggedDocument.type, draggedDocument.mimeType || undefined)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {draggedDocument.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getTypeColor(draggedDocument.type)} variant="secondary">
                      {draggedDocument.type}
                    </Badge>
                    {draggedDocument.tags && draggedDocument.tags.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {draggedDocument.tags.length} tags
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}