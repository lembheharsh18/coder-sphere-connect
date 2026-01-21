
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clipboard, ArrowLeft, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CodeSolution, CodeComment } from '@/types/contest';
import { getContestSolutions, getSolutionComments, addCommentToSolution, likeSolution } from '@/api/contestSolutions';
import SolutionComments from '@/components/contests/SolutionComments';
import AddCommentForm from '@/components/contests/AddCommentForm';

const CodeSolutionView: React.FC = () => {
  const { solutionId, contestId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [solution, setSolution] = useState<CodeSolution | null>(null);
  const [comments, setComments] = useState<CodeComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);

  useEffect(() => {
    const fetchSolution = async () => {
      if (!contestId || !solutionId) return;
      
      setIsLoading(true);
      try {
        const solutions = await getContestSolutions(contestId);
        const foundSolution = solutions.find(s => s.id === solutionId);
        
        if (foundSolution) {
          setSolution(foundSolution);
        } else {
          toast({
            title: "Error",
            description: "Solution not found",
            variant: "destructive"
          });
          navigate(-1);
        }
      } catch (error) {
        console.error("Failed to fetch solution:", error);
        toast({
          title: "Error",
          description: "Failed to load solution details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!solutionId) return;
      
      setIsCommentsLoading(true);
      try {
        const fetchedComments = await getSolutionComments(solutionId);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsCommentsLoading(false);
      }
    };

    fetchSolution();
    fetchComments();
  }, [solutionId, contestId, navigate, toast]);

  const handleCopyCode = () => {
    if (solution) {
      navigator.clipboard.writeText(solution.code);
      toast({
        description: "Code copied to clipboard",
      });
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !solution || !contestId) {
      toast({
        description: "You must be logged in to like solutions",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await likeSolution(solution.id, user!.id, contestId);
      // Refresh solution to get updated likes count
      const solutions = await getContestSolutions(contestId);
      const updatedSolution = solutions.find(s => s.id === solution.id);
      if (updatedSolution) {
        setSolution(updatedSolution);
      }
      
      toast({
        description: "Solution liked successfully",
      });
    } catch (error) {
      toast({
        description: "Failed to like solution",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async (content: string) => {
    if (!isAuthenticated || !solution || !solutionId) {
      toast({
        description: "You must be logged in to comment",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newComment = await addCommentToSolution(
        solutionId,
        contestId!,
        content,
        user!.id,
        user!.name,
        user!.image
      );
      
      setComments(prevComments => [newComment, ...prevComments]);
      
      if (solution) {
        setSolution({
          ...solution,
          commentsCount: solution.commentsCount + 1
        });
      }
      
      toast({
        description: "Comment added successfully",
      });
    } catch (error) {
      toast({
        description: "Failed to add comment",
        variant: "destructive"
      });
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
      <MainLayout>
        <div className="container max-w-4xl py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="h-60 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-2 mt-8">
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!solution) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Solution Not Found</h2>
            <p className="text-muted-foreground mb-4">The solution you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Map language to syntax highlighting class and display name
  const languageClass = {
    'javascript': 'language-javascript',
    'typescript': 'language-typescript',
    'python': 'language-python',
    'java': 'language-java',
    'cpp': 'language-cpp',
    'csharp': 'language-csharp'
  }[solution.language] || 'language-javascript';

  const languageDisplay = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'csharp': 'C#'
  }[solution.language] || solution.language;

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{solution.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge>{languageDisplay}</Badge>
                    {solution.problemNumber && <Badge variant="outline">Problem {solution.problemNumber}</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center mt-4">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={solution.userImage || undefined} alt={solution.userName} />
                  <AvatarFallback>{solution.userName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium">{solution.userName}</span>
                  <span className="text-xs text-muted-foreground block">{formatDate(solution.createdAt)}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <pre className={`${languageClass} overflow-x-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-md`}>
                <code>{solution.code}</code>
              </pre>
            </CardContent>
            
            <CardFooter>
              <div className="w-full">
                <div className="flex items-center gap-4 mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLike} 
                    className="flex items-center gap-1"
                  >
                    Like ({solution.likesCount})
                  </Button>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" /> {solution.commentsCount} comments
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <AddCommentForm onSubmit={handleAddComment} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Log in to add your comment
                    </p>
                  )}
                </div>
                
                <SolutionComments comments={comments} isLoading={isCommentsLoading} />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CodeSolutionView;
