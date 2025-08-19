import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface ProgressNote {
  id: string;
  date: string;
  comment: string;
  createdAt: string;
}

interface ProgressSectionProps {
  progressNotes: ProgressNote[];
  onAddProgress: (note: { date: string; comment: string }) => void;
  isLoading?: boolean;
}

export default function ProgressSection({ 
  progressNotes = [], 
  onAddProgress, 
  isLoading = false 
}: ProgressSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      return;
    }

    onAddProgress({
      date,
      comment: comment.trim(),
    });

    // Reset form
    setComment("");
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setIsAdding(false);
  };

  const handleCancel = () => {
    setComment("");
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setIsAdding(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Progress Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Notes List */}
        {progressNotes.length > 0 ? (
          <div className="space-y-3">
            {progressNotes
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((note) => (
                <div
                  key={note.id}
                  className="flex items-start space-x-3 mb-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {note.comment.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-2xl rounded-tl-sm p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-blue-900">
                        Progress Update
                      </span>
                      <span className="text-xs text-blue-600">
                        {format(new Date(note.createdAt), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{note.comment}</p>
                    <div className="flex items-center mt-2 text-xs text-blue-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(note.date), 'MMMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No progress notes yet.</p>
        )}

        {/* Add Progress Note Form */}
        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-blue-50 rounded-lg border">
            <div className="space-y-2">
              <label htmlFor="progress-date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="progress-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="progress-comment" className="text-sm font-medium">
                Progress Comment
              </label>
              <Textarea
                id="progress-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe the progress made, challenges encountered, or next steps..."
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Progress Note"}
              </Button>
            </div>
          </form>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Progress Note
          </Button>
        )}
      </CardContent>
    </Card>
  );
}