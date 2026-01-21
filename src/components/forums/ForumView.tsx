
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Forum, ForumPost } from '@/api/forums';
import { CalendarIcon, ArrowLeft, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ForumViewProps {
  forum: Forum | null;
  posts: ForumPost[];
  isLoading: boolean;
  onNewPost: () => void;
}

const ForumView: React.FC<ForumViewProps> = ({ forum, posts, isLoading, onNewPost }) => {
  const { isAuthenticated } = useAuth();

  if (isLoading || !forum) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-9 bg-gray-200 rounded w-24"></div>
        </div>
        <div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4 pb-0">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/forums">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Forums
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">{forum.title}</h1>
        <p className="text-muted-foreground">{forum.description}</p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Posts</h2>
        {isAuthenticated && (
          <Button onClick={onNewPost}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
            {isAuthenticated && (
              <Button className="mt-4" onClick={onNewPost}>
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="p-4 pb-0">
                <Link
                  to={`/forums/${forum.id}/posts/${post.id}`}
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              </CardHeader>
              <CardContent className="p-4">
                <p className="line-clamp-3">{post.content}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {post.user?.image ? (
                      <AvatarImage src={post.user.image} alt={post.user?.name || "User"} />
                    ) : (
                      <AvatarFallback>{post.user?.name?.[0] || "U"}</AvatarFallback>
                    )}
                  </Avatar>
                  <span>{post.user?.name || "Unknown User"}</span>
                  <span className="flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/forums/${forum.id}/posts/${post.id}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumView;
