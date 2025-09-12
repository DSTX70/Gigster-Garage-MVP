import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { X, Plus, Tag, Palette } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TagManagerProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  documentId?: string;
}

const TAG_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800', 
  'bg-yellow-100 text-yellow-800',
  'bg-red-100 text-red-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-gray-100 text-gray-800'
];

export function TagManager({ availableTags, selectedTags, onTagsChange, documentId }: TagManagerProps) {
  const [newTag, setNewTag] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateDocumentTags = useMutation({
    mutationFn: async (tags: string[]) => {
      if (!documentId) return;
      const response = await fetch(`/api/client-documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags })
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-documents"] });
      toast({ title: "Tags updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to update tags", 
        variant: "destructive" 
      });
    }
  });

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag || selectedTags.includes(trimmedTag)) return;
    
    const newTags = [...selectedTags, trimmedTag];
    onTagsChange(newTags);
    
    if (documentId) {
      updateDocumentTags.mutate(newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    onTagsChange(newTags);
    
    if (documentId) {
      updateDocumentTags.mutate(newTags);
    }
  };

  const createNewTag = () => {
    if (!newTag.trim()) return;
    addTag(newTag);
    setNewTag("");
    setIsCreating(false);
  };

  const getTagColor = (tag: string) => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[hash % TAG_COLORS.length];
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Tags</Label>
      
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge 
            key={tag} 
            className={`${getTagColor(tag)} cursor-pointer`}
            data-testid={`tag-${tag}`}
          >
            {tag}
            <X 
              className="h-3 w-3 ml-1 hover:text-red-600" 
              onClick={() => removeTag(tag)}
              data-testid={`button-remove-tag-${tag}`}
            />
          </Badge>
        ))}
      </div>

      {/* Add Tag Controls */}
      <div className="flex gap-2">
        {isCreating ? (
          <div className="flex gap-2 flex-1">
            <Input
              placeholder="Enter new tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createNewTag()}
              className="flex-1"
              autoFocus
              data-testid="input-new-tag"
            />
            <Button 
              size="sm" 
              onClick={createNewTag}
              data-testid="button-confirm-new-tag"
            >
              Add
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsCreating(false)}
              data-testid="button-cancel-new-tag"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-add-tag"
              >
                <Tag className="h-4 w-4 mr-1" />
                Add Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" data-testid="popover-tag-selector">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Select Tags</h4>
                
                {/* Available Tags */}
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableTags
                    .filter(tag => !selectedTags.includes(tag))
                    .map((tag) => (
                      <div 
                        key={tag}
                        className={`p-2 rounded cursor-pointer hover:bg-gray-50 text-sm ${getTagColor(tag)}`}
                        onClick={() => addTag(tag)}
                        data-testid={`available-tag-${tag}`}
                      >
                        {tag}
                      </div>
                    ))}
                  
                  {availableTags.filter(tag => !selectedTags.includes(tag)).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No more tags available
                    </p>
                  )}
                </div>

                {/* Create New Tag */}
                <div className="border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreating(true);
                      document.querySelector('[data-testid="popover-tag-selector"]')?.closest('[data-state]')?.click();
                    }}
                    className="w-full"
                    data-testid="button-create-new-tag"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create New Tag
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}