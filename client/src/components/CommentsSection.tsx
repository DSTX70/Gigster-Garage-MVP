import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Reply, Edit3, Trash2, Paperclip, Send, AtSign, Users } from "lucide-react";

interface Comment {
  id: string;
  entityType: "task" | "project" | "client";
  entityId: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  parentId: string | null;
  mentions: string[];
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface CommentsSectionProps {
  entityType: "task" | "project" | "client";
  entityId: string;
  className?: string;
}

function CommentItem({ comment, onReply, onEdit, onDelete, level = 0 }: {
  comment: Comment;
  onReply: (parentId: string) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  level?: number;
}) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(true);
  
  const canEdit = user?.id === comment.authorId || user?.role === 'admin';
  const canDelete = canEdit;

  const getAuthorInitials = () => {
    if (comment.author?.name) {
      return comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  const isReply = level > 0;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`${isReply ? 'ml-4 sm:ml-6' : ''}`}>
      <div className="flex gap-3 group">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author?.profileImageUrl} />
          <AvatarFallback className="text-xs bg-[#0B1D3A] text-white">
            {getAuthorInitials()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-[#0B1D3A]">
                  {comment.author?.name || 'Unknown User'}
                </span>
                <span className="text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.isEdited && (
                  <Badge variant="outline" className="text-xs">
                    Edited
                  </Badge>
                )}
              </div>
              
              {canEdit && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(comment)}
                    className="h-6 px-2"
                    data-testid={`button-edit-comment-${comment.id}`}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(comment.id)}
                      className="h-6 px-2 text-red-600 hover:text-red-700"
                      data-testid={`button-delete-comment-${comment.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
              {comment.content}
            </div>

            {comment.mentions.length > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <AtSign className="w-3 h-3 text-blue-600" />
                <div className="flex gap-1 flex-wrap">
                  {comment.mentions.map((mentionId, index) => (
                    <Badge key={mentionId} variant="secondary" className="text-xs">
                      @User{index + 1}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {comment.attachments.length > 0 && (
              <div className="space-y-1">
                {comment.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
                    <Paperclip className="w-3 h-3 text-gray-500" />
                    <span className="flex-1 truncate">{attachment.filename}</span>
                    <span className="text-gray-500">{Math.round(attachment.size / 1024)}KB</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 ml-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="h-6 px-2 text-gray-600 hover:text-gray-800"
              data-testid={`button-reply-comment-${comment.id}`}
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>

            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-6 px-2 text-gray-600 hover:text-gray-800"
                data-testid={`button-toggle-replies-${comment.id}`}
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies?.length} replies
              </Button>
            )}
          </div>

          {hasReplies && showReplies && (
            <div className="mt-3 space-y-3">
              {comment.replies?.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentForm({ 
  entityType, 
  entityId, 
  onSubmit, 
  onCancel, 
  parentId = null, 
  editingComment = null,
  placeholder = "Write a comment..."
}: {
  entityType: "task" | "project" | "client";
  entityId: string;
  onSubmit: (content: string, mentions: string[]) => void;
  onCancel?: () => void;
  parentId?: string | null;
  editingComment?: Comment | null;
  placeholder?: string;
}) {
  const [content, setContent] = useState(editingComment?.content || '');
  const [mentions, setMentions] = useState<string[]>(editingComment?.mentions || []);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch users for mentions
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), mentions);
      setContent('');
      setMentions([]);
    }
  };

  const handleCancel = () => {
    setContent(editingComment?.content || '');
    setMentions(editingComment?.mentions || []);
    onCancel?.();
  };

  const addMention = (userId: string) => {
    if (!mentions.includes(userId)) {
      setMentions([...mentions, userId]);
    }
    setShowUserSelector(false);
  };

  const removeMention = (userId: string) => {
    setMentions(mentions.filter(id => id !== userId));
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] resize-none"
            data-testid="textarea-comment-content"
          />

          {mentions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <AtSign className="w-4 h-4 text-blue-600" />
              {mentions.map((mentionId) => {
                const user = users.find(u => u.id === mentionId);
                return (
                  <Badge 
                    key={mentionId} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => removeMention(mentionId)}
                  >
                    @{user?.name || 'Unknown'} ×
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dialog open={showUserSelector} onOpenChange={setShowUserSelector}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-mention-user">
                    <AtSign className="w-4 h-4 mr-1" />
                    Mention
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mention Users</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-60">
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={`comments-mention-${user.id}`}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                            mentions.includes(user.id) ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                          onClick={() => addMention(user.id)}
                          data-testid={`option-mention-user-${user.id}`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-[#0B1D3A] text-white">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" disabled className="opacity-50">
                <Paperclip className="w-4 h-4 mr-1" />
                Attach
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                  data-testid="button-cancel-comment"
                >
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleSubmit} 
                disabled={!content.trim()}
                size="sm"
                data-testid="button-submit-comment"
              >
                <Send className="w-4 h-4 mr-1" />
                {editingComment ? 'Update' : parentId ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CommentsSection({ entityType, entityId, className = "" }: CommentsSectionProps) {
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["/api/comments", entityType, entityId],
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; parentId?: string; mentions: string[] }) =>
      apiRequest("POST", "/api/comments", {
        entityType,
        entityId,
        content: data.content,
        parentId: data.parentId,
        mentions: data.mentions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", entityType, entityId] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
      setReplyingTo(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: (data: { id: string; content: string; mentions: string[] }) =>
      apiRequest("PUT", `/api/comments/${data.id}`, {
        content: data.content,
        mentions: data.mentions,
        isEdited: true,
        editedAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", entityType, entityId] });
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
      setEditingComment(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      apiRequest("DELETE", `/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", entityType, entityId] });
      toast({
        title: "Comment deleted",
        description: "The comment has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (content: string, mentions: string[]) => {
    createCommentMutation.mutate({ 
      content, 
      mentions,
      parentId: replyingTo || undefined 
    });
  };

  const handleEditComment = (content: string, mentions: string[]) => {
    if (editingComment) {
      updateCommentMutation.mutate({
        id: editingComment.id,
        content,
        mentions,
      });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  // Organize comments into a tree structure
  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentsMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentsMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentsMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentsMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const organizedComments = organizeComments(comments);
  const totalComments = comments.length;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-16 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#0B1D3A] flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({totalComments})
        </h3>
        {totalComments > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Comment form */}
      {editingComment ? (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Editing comment</div>
          <CommentForm
            entityType={entityType}
            entityId={entityId}
            onSubmit={handleEditComment}
            onCancel={() => setEditingComment(null)}
            editingComment={editingComment}
            placeholder="Edit your comment..."
          />
        </div>
      ) : (
        <CommentForm
          entityType={entityType}
          entityId={entityId}
          onSubmit={handleSubmitComment}
        />
      )}

      {/* Reply form */}
      {replyingTo && (
        <div className="ml-4 sm:ml-6 space-y-2">
          <div className="text-sm font-medium text-gray-700">Replying to comment</div>
          <CommentForm
            entityType={entityType}
            entityId={entityId}
            onSubmit={handleSubmitComment}
            onCancel={() => setReplyingTo(null)}
            parentId={replyingTo}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {organizedComments.length > 0 ? (
          organizedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyingTo}
              onEdit={setEditingComment}
              onDelete={handleDeleteComment}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-500">Be the first to leave a comment on this {entityType}.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}