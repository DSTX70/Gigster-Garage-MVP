import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TagCloudProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onClearAll: () => void;
}

const TAG_COLORS = [
  'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'bg-green-100 text-green-800 hover:bg-green-200', 
  'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'bg-red-100 text-red-800 hover:bg-red-200',
  'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'bg-pink-100 text-pink-800 hover:bg-pink-200',
  'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  'bg-gray-100 text-gray-800 hover:bg-gray-200'
];

export function TagCloud({ tags, selectedTags, onTagSelect, onTagRemove, onClearAll }: TagCloudProps) {
  const getTagColor = (tag: string) => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[hash % TAG_COLORS.length];
  };

  if (tags.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No tags available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
              data-testid="button-clear-all-tags"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge 
                key={tag} 
                className={`${getTagColor(tag)} cursor-pointer transition-colors`}
                data-testid={`selected-tag-${tag}`}
              >
                {tag}
                <X 
                  className="h-3 w-3 ml-1 hover:text-red-600" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagRemove(tag);
                  }}
                  data-testid={`button-remove-filter-${tag}`}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* All Available Tags */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">All Tags:</span>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge 
                key={tag} 
                className={`${getTagColor(tag)} cursor-pointer transition-colors ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onTagSelect(tag)}
                data-testid={`tag-cloud-${tag}`}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}