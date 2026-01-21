
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clipboard, ThumbsUp, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface CodeSolutionProps {
  id: string;
  title: string;
  code: string;
  language: string;
  problemNumber?: string;
  authorName: string;
  authorImage?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  contestId?: string;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
}

const CodeSolutionCard = ({
  id,
  title,
  code,
  language,
  problemNumber,
  authorName,
  authorImage,
  likesCount,
  commentsCount,
  createdAt,
  contestId,
  onLike,
  onComment
}: CodeSolutionProps) => {
  const { toast } = useToast();
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      description: "Code copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  // Map language to syntax highlighting class (can be expanded)
  const languageClass = {
    'javascript': 'language-javascript',
    'typescript': 'language-typescript',
    'python': 'language-python',
    'java': 'language-java',
    'cpp': 'language-cpp',
    'csharp': 'language-csharp'
  }[language] || 'language-javascript';

  const languageDisplay = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'csharp': 'C#'
  }[language] || language;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            {contestId ? (
              <Link to={`/solutions/${contestId}/${id}`}>
                <CardTitle className="text-lg hover:text-primary hover:underline cursor-pointer">{title}</CardTitle>
              </Link>
            ) : (
              <CardTitle className="text-lg">{title}</CardTitle>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge>{languageDisplay}</Badge>
              {problemNumber && <Badge variant="outline">Problem {problemNumber}</Badge>}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopyCode}>
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className={`${languageClass} overflow-x-auto bg-slate-100 dark:bg-slate-800 p-4 rounded-md text-sm`}>
          <code>{code}</code>
        </pre>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <Avatar className="h-7 w-7 mr-2">
            <AvatarImage src={authorImage} alt={authorName} />
            <AvatarFallback>{authorName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <span className="text-sm font-medium">{authorName}</span>
            <span className="text-xs text-muted-foreground ml-2">{formatDate(createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onLike?.(id)} 
            className="flex items-center gap-1"
          >
            <ThumbsUp className="h-4 w-4" /> {likesCount}
          </Button>
          {contestId ? (
            <Link to={`/solutions/${contestId}/${id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" /> {commentsCount}
              </Button>
            </Link>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onComment?.(id)} 
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" /> {commentsCount}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CodeSolutionCard;
