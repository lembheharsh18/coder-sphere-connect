
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share2, MoreHorizontal, Code, Send, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { FeedPost as FeedPostType, FeedComment } from '@/types/feed';
import { likePost, unlikePost, commentOnPost, deletePost } from '@/api/feed';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedPostProps {
  post: FeedPostType;
  onPostUpdate: () => void;
}

export const FeedPost: React.FC<FeedPostProps> = ({ post, onPostUpdate }) => {
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentContent, setCommentContent] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [localLikes, setLocalLikes] = useState<number>(post.likes);
  const [localHasLiked, setLocalHasLiked] = useState<boolean>(post.hasLiked);
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) {
      toast.error("You need to be logged in to like posts");
      return;
    }

    if (isLiking) return;

    // Optimistic update
    const wasLiked = localHasLiked;
    const prevLikes = localLikes;
    
    setIsLiking(true);
    setLocalHasLiked(!wasLiked);
    setLocalLikes(wasLiked ? prevLikes - 1 : prevLikes + 1);
    
    try {
      if (wasLiked) {
        const result = await unlikePost(post.id);
        setLocalLikes(result.likesCount);
        setLocalHasLiked(result.hasLiked);
      } else {
        const result = await likePost(post.id);
        setLocalLikes(result.likesCount);
        setLocalHasLiked(result.hasLiked);
      }
    } catch (error) {
      // Revert optimistic update
      setLocalHasLiked(wasLiked);
      setLocalLikes(prevLikes);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) return;
    
    if (!user) {
      toast.error("You need to be logged in to comment");
      return;
    }
    
    try {
      setIsSubmittingComment(true);
      await commentOnPost(post.id, commentContent, user.id);
      setCommentContent('');
      onPostUpdate();
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleDeletePost = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      toast.success("Post deleted successfully");
      onPostUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const isOwnPost = user && post.author.id === user.id;

  // Check if this is a project-related post
  const isProjectPost = post.type === 'project_created' || post.type === 'collaboration_added';

  return (
    <Card className="mb-4 border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-start space-y-0 space-x-4 pb-3">
        <Avatar className="h-10 w-10 border">
          {post.author.image ? (
            <AvatarImage src={post.author.image} alt={post.author.name} />
          ) : (
            <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold leading-none text-foreground">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">{post.author.role}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            {isOwnPost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {!isOwnPost && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 pt-2 text-foreground">
        <p className="whitespace-pre-line">{post.content}</p>
        
        {isProjectPost && post.projectId && (
          <div className="mt-4 p-3 bg-primary/5 rounded-md border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-primary" />
              <span className="font-medium">Project Collaboration</span>
            </div>
            <Link 
              to={`/projects/${post.projectId}`} 
              className="text-primary hover:underline block mt-1"
            >
              View Project Details
            </Link>
          </div>
        )}
        
        {post.media && post.media.length > 0 && (
          <div className="mt-4 rounded-md overflow-hidden">
            {post.media.map((item, index) => (
              item.type === 'image' ? (
                <img 
                  key={index}
                  src={item.url} 
                  alt="Post media" 
                  className="w-full h-auto object-cover max-h-[400px]"
                  loading="lazy"
                />
              ) : (
                <video 
                  key={index}
                  src={item.url} 
                  controls 
                  className="w-full"
                />
              )
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 flex flex-col">
        <div className="flex justify-between items-center w-full mb-3">
          <div className="flex space-x-2 text-xs text-muted-foreground">
            <span>{localLikes} likes</span>
            <span>•</span>
            <span>{post.comments} comments</span>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-2 transition-all ${localHasLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart 
                className={`h-4 w-4 mr-1 transition-all ${localHasLiked ? 'fill-red-500 text-red-500 scale-110' : ''}`} 
              />
              <span>{localHasLiked ? 'Liked' : 'Like'}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>Comment</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Post by ${post.author.name}`,
                    text: post.content.substring(0, 100),
                    url: window.location.origin + `/post/${post.id}`,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
                  toast.success("Link copied to clipboard!");
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button>
          </div>
        </div>
        
        {showComments && (
          <div className="w-full">
            {/* Comment input */}
            {user ? (
              <div className="flex gap-2 mb-3">
                <Avatar className="h-8 w-8 border">
                  {user?.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : (
                    <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Write a comment..."
                    className="resize-none min-h-[40px] pr-10"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <Button 
                    size="icon" 
                    className="h-7 w-7 absolute right-2 bottom-2" 
                    onClick={handleSubmitComment}
                    disabled={isSubmittingComment || !commentContent.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 mb-3">
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">Sign in</Link> to comment on this post
                </p>
              </div>
            )}
            
            {/* Comments list */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {post.commentsList && post.commentsList.length > 0 ? (
                post.commentsList.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-8 w-8 border">
                      {comment.author.image ? (
                        <AvatarImage src={comment.author.image} alt={comment.author.name} />
                      ) : (
                        <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-background rounded-lg p-2 text-sm">
                        <p className="font-semibold">{comment.author.name}</p>
                        <p>{comment.content}</p>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default FeedPost;
