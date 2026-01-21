
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CodeSolutionDialog from './CodeSolutionDialog';
import CodeSolutionCard from './CodeSolutionCard';
import { CodeSolution } from '@/types/contest';
import { useToast } from '@/hooks/use-toast';

interface ContestSolutionsTabProps {
  contestId: string;
  solutions: CodeSolution[];
  isLoading: boolean;
  onAddSolution: (data: {
    title: string;
    code: string;
    language: string;
    problemNumber: string;
    contestId: string;
  }) => Promise<void>;
  onLikeSolution: (solutionId: string) => Promise<void>;
  onCommentSolution: (solutionId: string) => void;
}

const ContestSolutionsTab: React.FC<ContestSolutionsTabProps> = ({
  contestId,
  solutions,
  isLoading,
  onAddSolution,
  onLikeSolution,
  onCommentSolution
}) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLike = async (solutionId: string) => {
    if (!isAuthenticated) {
      toast({
        description: "You must be logged in to like solutions",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await onLikeSolution(solutionId);
    } catch (error) {
      toast({
        description: "Failed to like solution",
        variant: "destructive"
      });
    }
  };

  const handleComment = (solutionId: string) => {
    if (!isAuthenticated) {
      toast({
        description: "You must be logged in to comment on solutions",
        variant: "destructive"
      });
      return;
    }
    
    onCommentSolution(solutionId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="flex justify-between">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shared Solutions</h3>
        {isAuthenticated && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Share Solution
          </Button>
        )}
      </div>

      {solutions.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground">No solutions have been shared yet.</p>
          {isAuthenticated ? (
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Be the first to share
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">Log in to share your solution</p>
          )}
        </div>
      ) : (
        <div>
          {solutions.map((solution) => (
            <CodeSolutionCard
              key={solution.id}
              id={solution.id}
              title={solution.title}
              code={solution.code}
              language={solution.language}
              problemNumber={solution.problemNumber}
              authorName={solution.userName}
              authorImage={solution.userImage || undefined}
              likesCount={solution.likesCount}
              commentsCount={solution.commentsCount}
              createdAt={solution.createdAt}
              contestId={contestId}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
        </div>
      )}

      <CodeSolutionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contestId={contestId}
        onSubmit={onAddSolution}
      />
    </div>
  );
};

export default ContestSolutionsTab;
