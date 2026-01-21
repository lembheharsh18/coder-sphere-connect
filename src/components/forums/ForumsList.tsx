
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Forum } from '@/api/forums';

interface ForumsListProps {
  forums: Forum[];
  isLoading: boolean;
}

const ForumsList: React.FC<ForumsListProps> = ({ forums, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-4 pb-0">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {forums.map((forum) => (
        <Card key={forum.id}>
          <CardHeader className="p-4 pb-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <Link
                to={`/forums/${forum.id}`}
                className="text-lg font-semibold hover:text-primary transition-colors"
              >
                {forum.title}
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-muted-foreground">
              {forum.description}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
            <span>{forum.postCount} posts</span>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/forums/${forum.id}`}>View Forum</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ForumsList;
