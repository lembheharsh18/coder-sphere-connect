
import React from 'react';
import { CodeComment } from '@/types/contest';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface SolutionCommentsProps {
  comments: CodeComment[];
  isLoading: boolean;
}

const SolutionComments: React.FC<SolutionCommentsProps> = ({ comments, isLoading }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse flex gap-3">
            <div className="rounded-full bg-slate-200 h-8 w-8"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-16 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="mt-4 text-center py-8">
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-medium">Comments ({comments.length})</h3>
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3 pb-4 border-b">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.userImage || undefined} alt={comment.userName} />
            <AvatarFallback>{comment.userName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.userName}</span>
              <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
            </div>
            <div className="mt-1 text-sm whitespace-pre-line">{comment.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SolutionComments;
