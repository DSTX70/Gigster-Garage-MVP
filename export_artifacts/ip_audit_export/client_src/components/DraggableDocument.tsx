import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, File, Download, MoreVertical, Edit2, Trash2, Eye, Calendar, User, Building, Folder, Tag, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { ClientDocument, Client } from "@shared/schema";

interface DraggableDocumentProps {
  document: ClientDocument & { 
    client?: Client; 
    uploadedBy?: { name: string; email: string }; 
  };
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  folders: Array<{ id: string; name: string }>;
}

export function DraggableDocument({ 
  document, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete,
  folders 
}: DraggableDocumentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: document.id,
    data: {
      type: 'document',
      document,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

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

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`hover:shadow-lg transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${
        isDragging ? 'opacity-50' : ''
      }`}
      data-testid={`document-card-${document.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              data-testid={`checkbox-select-${document.id}`}
            />
            
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing flex-shrink-0"
              data-testid={`drag-handle-${document.id}`}
            >
              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </div>
            
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
                    {folders.find(f => f.id === document.metadata?.folder)?.name}
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
                <DropdownMenuItem onClick={onEdit}>
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
                        onClick={onDelete}
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
}