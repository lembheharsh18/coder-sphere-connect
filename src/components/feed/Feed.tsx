
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { getFeedPosts } from '@/api/feed';
import { FeedPost as FeedPostType } from '@/types/feed';
import FeedPost from './FeedPost';
import CreatePostCard from './CreatePostCard';
import { useAuth } from '@/contexts/AuthContext';

interface FeedProps {
  showCreatePost?: boolean;
}

export const Feed: React.FC<FeedProps> = ({ showCreatePost = true }) => {
  const [posts, setPosts] = useState<FeedPostType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoad = useRef<boolean>(true);
  const { user } = useAuth();

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  const loadPosts = useCallback(async (pageNum: number) => {
    if (!hasMore && pageNum > 1) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getFeedPosts(user?.id, pageNum);
      
      setPosts(prev => pageNum === 1 ? response.posts : [...prev, ...response.posts]);
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError("Failed to load posts. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
      initialLoad.current = false;
    }
  }, [hasMore, user?.id]);

  // Initial load
  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && !isLoading && hasMore && !initialLoad.current) {
      loadPosts(page + 1);
    }
  }, [inView, isLoading, hasMore, page, loadPosts]);

  // Force refresh feed
  const refreshFeed = useCallback(() => {
    loadPosts(1);
  }, [loadPosts]);

  if (error && posts.length === 0) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => loadPosts(1)}
          className="mt-2 px-4 py-2 bg-primary text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="feed w-full max-w-3xl mx-auto">
      {showCreatePost && user && <CreatePostCard onPostCreated={refreshFeed} />}
      
      {posts.map(post => (
        <FeedPost 
          key={post.id} 
          post={post} 
          onPostUpdate={refreshFeed} 
        />
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      
      {/* Infinite scroll trigger */}
      {!isLoading && hasMore && (
        <div ref={ref} className="h-10" />
      )}
      
      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-semibold">No posts yet</h3>
          <p className="text-muted-foreground mt-1">Be the first to share something with the community!</p>
        </div>
      )}
      
      {/* End of feed message */}
      {!isLoading && !hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p>You've reached the end of the feed</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
