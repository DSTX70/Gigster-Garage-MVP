import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Folder, FolderOpen, Tag, Archive, FileText, Clock, CheckCircle } from "lucide-react";
import type { VirtualFolder } from "./FolderManager";

interface DroppableFolderProps {
  folder: VirtualFolder;
  isSelected?: boolean;
  onClick?: () => void;
}

export function DroppableFolder({ folder, isSelected, onClick }: DroppableFolderProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `folder-${folder.id}`,
    data: {
      type: 'folder',
      folder,
    },
  });

  const getFolderColor = (folderId: string) => {
    if (isSelected) return 'bg-blue-100 text-blue-800';
    if (isOver) return 'bg-green-100 text-green-800 ring-2 ring-green-500';
    return 'hover:bg-gray-100';
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${getFolderColor(folder.id)}`}
      onClick={onClick}
      data-testid={`droppable-folder-${folder.id}`}
    >
      {isSelected ? (
        <FolderOpen className="h-4 w-4" />
      ) : (
        <Folder className="h-4 w-4" />
      )}
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
      {isOver && (
        <div className="text-green-600 text-xs">
          Drop here
        </div>
      )}
    </div>
  );
}

interface DroppableAllFilesProps {
  isSelected?: boolean;
  onClick?: () => void;
  documentCount?: number;
}

export function DroppableAllFiles({ isSelected, onClick, documentCount }: DroppableAllFilesProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'folder-all',
    data: {
      type: 'folder',
      folder: { id: null, name: 'All Files' },
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
        isSelected ? 'bg-blue-100 text-blue-800' : 
        isOver ? 'bg-green-100 text-green-800 ring-2 ring-green-500' : 
        'hover:bg-gray-100'
      }`}
      onClick={onClick}
      data-testid="droppable-folder-all-files"
    >
      <FolderOpen className="h-4 w-4" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span>All Files</span>
          {documentCount !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {documentCount}
            </Badge>
          )}
        </div>
      </div>
      {isOver && (
        <div className="text-green-600 text-xs">
          Drop here
        </div>
      )}
    </div>
  );
}

interface DroppableTagProps {
  tag: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function DroppableTag({ tag, isSelected, onClick }: DroppableTagProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `tag-${tag}`,
    data: {
      type: 'tag',
      tag,
    },
  });

  const getTagColor = (tagName: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'bg-green-100 text-green-800 hover:bg-green-200', 
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'bg-red-100 text-red-800 hover:bg-red-200',
      'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'bg-pink-100 text-pink-800 hover:bg-pink-200',
      'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      'bg-gray-100 text-gray-800 hover:bg-gray-200'
    ];
    const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div
      ref={setNodeRef}
      data-testid={`droppable-tag-${tag}`}
    >
      <Badge 
        className={`${getTagColor(tag)} cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${
          isOver ? 'ring-2 ring-green-500 scale-110' : ''
        }`}
        onClick={onClick}
      >
        <Tag className="h-3 w-3 mr-1" />
        {tag}
        {isOver && (
          <span className="ml-2 text-green-600 text-xs">+</span>
        )}
      </Badge>
    </div>
  );
}

interface DroppableStatusZoneProps {
  status: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  documentCount?: number;
}

export function DroppableStatusZone({ 
  status, 
  label, 
  icon, 
  color, 
  documentCount 
}: DroppableStatusZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `status-${status}`,
    data: {
      type: 'status',
      status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg border-2 border-dashed transition-all ${
        isOver 
          ? 'border-green-500 bg-green-50 scale-105' 
          : `border-gray-300 ${color} hover:border-gray-400`
      }`}
      data-testid={`droppable-status-${status}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{label}</h3>
          {documentCount !== undefined && (
            <p className="text-sm text-gray-600">{documentCount} documents</p>
          )}
          {isOver && (
            <p className="text-sm text-green-600 font-medium">Drop to change status</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Pre-built status zones
export const StatusZones = {
  Draft: (props: { documentCount?: number }) => (
    <DroppableStatusZone
      status="draft"
      label="Draft"
      icon={<FileText className="h-5 w-5 text-yellow-600" />}
      color="bg-yellow-50"
      documentCount={props.documentCount}
    />
  ),
  Active: (props: { documentCount?: number }) => (
    <DroppableStatusZone
      status="active"
      label="Active"
      icon={<CheckCircle className="h-5 w-5 text-green-600" />}
      color="bg-green-50"
      documentCount={props.documentCount}
    />
  ),
  Archived: (props: { documentCount?: number }) => (
    <DroppableStatusZone
      status="archived"
      label="Archived"
      icon={<Archive className="h-5 w-5 text-gray-600" />}
      color="bg-gray-50"
      documentCount={props.documentCount}
    />
  ),
  Expired: (props: { documentCount?: number }) => (
    <DroppableStatusZone
      status="expired"
      label="Expired"
      icon={<Clock className="h-5 w-5 text-red-600" />}
      color="bg-red-50"
      documentCount={props.documentCount}
    />
  ),
};