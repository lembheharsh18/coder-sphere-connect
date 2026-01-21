
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, Copy, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const snippets = [
  {
    id: '1',
    title: 'React useDebounce Hook',
    code: `import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
    language: 'typescript',
    user: {
      name: 'Alex Johnson',
      image: '',
      initials: 'AJ'
    },
    likes: 43,
    comments: 5,
    tags: ['React', 'Hooks', 'TypeScript']
  },
  {
    id: '2',
    title: 'Array Flattening Function',
    code: `function flattenArray(arr) {
  return arr.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenArray(item) : item);
  }, []);
}

// Usage
const nested = [1, [2, 3], [4, [5, 6]]];
const flattened = flattenArray(nested); // [1, 2, 3, 4, 5, 6]`,
    language: 'javascript',
    user: {
      name: 'Sarah Lee',
      image: '',
      initials: 'SL'
    },
    likes: 28,
    comments: 3,
    tags: ['JavaScript', 'Arrays', 'Recursion']
  }
];

const CodeSnippetsSection = () => {
  const { toast } = useToast();
  
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "The code snippet has been copied to your clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Popular Code Snippets</h2>
        <Button>Share a Snippet</Button>
      </div>
      
      <div className="space-y-6">
        {snippets.map((snippet) => (
          <Card key={snippet.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={snippet.user.image} alt={snippet.user.name} />
                    <AvatarFallback>{snippet.user.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{snippet.title}</CardTitle>
                    <CardDescription className="text-sm">by {snippet.user.name}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {snippet.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => copyToClipboard(snippet.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="whitespace-pre-wrap">{snippet.code}</pre>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{snippet.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{snippet.comments}</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Button variant="outline">Load More Snippets</Button>
      </div>
    </div>
  );
};

export default CodeSnippetsSection;
