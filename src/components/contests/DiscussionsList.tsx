
import React, { useState } from 'react';
import { ContestDiscussion } from '@/types/contest';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface DiscussionsListProps {
  discussions: ContestDiscussion[];
  isLoading: boolean;
  onAddComment: (discussionId: string, content: string) => Promise<void>;
}

const DiscussionsList: React.FC<DiscussionsListProps> = ({ 
  discussions, 
  isLoading,
  onAddComment
}) => {
  const { isAuthenticated } = useAuth();
  const [expandedDiscussions, setExpandedDiscussions] = useState<Record<string, boolean>>({});
  const [commentValues, setCommentValues] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  const toggleDiscussion = (id: string) => {
    setExpandedDiscussions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCommentChange = (discussionId: string, value: string) => {
    setCommentValues(prev => ({
      ...prev,
      [discussionId]: value
    }));
  };

  const handleSubmitComment = async (discussionId: string) => {
    if (!commentValues[discussionId]?.trim()) return;
    
    setSubmittingComment(discussionId);
    try {
      await onAddComment(discussionId, commentValues[discussionId]);
      // Clear the comment input after successful submission
      setCommentValues(prev => ({
        ...prev,
        [discussionId]: ''
      }));
    } finally {
      setSubmittingComment(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="flex justify-between">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <p className="text-muted-foreground">No discussions have been started yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          {isAuthenticated 
            ? "Create a new discussion to get the conversation started!"
            : "Log in to start a discussion."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {discussions.map((discussion) => (
        <Card key={discussion.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{discussion.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={discussion.userImage || undefined} alt={discussion.userName} />
                    <AvatarFallback>{discussion.userName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {discussion.userName} • {formatDate(discussion.createdAt)}
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleDiscussion(discussion.id)}
              >
                {expandedDiscussions[discussion.id] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">{discussion.content}</div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="flex items-center gap-2 w-full mb-2">
              <Badge variant="outline" className="cursor-pointer">
                <MessageSquare className="h-3 w-3 mr-1" />
                {discussion.comments?.length || 0} {(discussion.comments?.length || 0) === 1 ? 'comment' : 'comments'}
              </Badge>
              <div className="flex-grow"></div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleDiscussion(discussion.id)}
              >
                {expandedDiscussions[discussion.id] ? 'Hide Comments' : 'Show Comments'}
              </Button>
            </div>
            
            {expandedDiscussions[discussion.id] && (
              <div className="w-full mt-4">
                {/* Comments list */}
                {discussion.comments && discussion.comments.length > 0 ? (
                  <div className="space-y-4 mb-4">
                    {discussion.comments.map(comment => (
                      <div key={comment.id} className="p-3 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.userImage || undefined} alt={comment.userName} />
                            <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm whitespace-pre-line">{comment.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">No comments yet</p>
                )}
                
                {/* Add comment form */}
                {isAuthenticated && (
                  <div className="mt-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentValues[discussion.id] || ''}
                      onChange={(e) => handleCommentChange(discussion.id, e.target.value)}
                      className="mb-2"
                      disabled={submittingComment === discussion.id}
                    />
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => handleSubmitComment(discussion.id)}
                        disabled={!commentValues[discussion.id]?.trim() || submittingComment === discussion.id}
                      >
                        {submittingComment === discussion.id ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default DiscussionsList;
