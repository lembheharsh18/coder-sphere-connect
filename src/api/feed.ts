
import { api } from "@/lib/apiClient";
import { FeedPost, FeedComment } from "@/types/feed";
import { toast } from "sonner";

export const createFeedPost = async (content: string, userId: string, media?: {type: 'image' | 'video', url: string}[]): Promise<FeedPost> => {
  try {
    const response = await api.createPost("", content);
    const post = response.post;
    return {
      id: post.id,
      content: post.content,
      author: {
        id: post.user.id,
        name: post.user.name,
        role: post.user.role,
        image: post.user.image
      },
      createdAt: new Date(post.createdAt),
      likes: 0,
      comments: 0,
      hasLiked: false,
      media: media || [],
      commentsList: []
    };
  } catch (error: any) {
    console.error("Error creating feed post:", error);
    toast.error(error.message || "Failed to create post");
    throw error;
  }
};

export const getFeedPosts = async (userId: string | undefined, page: number = 1, limit: number = 20): Promise<{posts: FeedPost[], hasMore: boolean}> => {
  try {
    const response = await api.getPosts();
    const posts = response.posts.map((post: any) => ({
      id: post.id,
      content: post.content,
      author: {
        id: post.user.id,
        name: post.user.name,
        role: post.user.role || 'USER',
        image: post.user.image
      },
      createdAt: new Date(post.createdAt),
      likes: post.likesCount || 0,
      comments: post.commentsCount || post.comments?.length || 0,
      hasLiked: post.hasLiked || false,
      media: [],
      commentsList: (post.comments || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        author: {
          id: c.user.id,
          name: c.user.name,
          image: c.user.image
        },
        createdAt: new Date(c.createdAt),
        postId: post.id
      }))
    }));
    
    return { 
      posts, 
      hasMore: false 
    };
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    return { posts: [], hasMore: false };
  }
};

export const likePost = async (postId: string): Promise<{ likesCount: number; hasLiked: boolean }> => {
  try {
    const response = await api.likePost(postId);
    return { likesCount: response.likesCount, hasLiked: response.hasLiked };
  } catch (error: any) {
    console.error("Error liking post:", error);
    throw error;
  }
};

export const unlikePost = async (postId: string): Promise<{ likesCount: number; hasLiked: boolean }> => {
  try {
    const response = await api.unlikePost(postId);
    return { likesCount: response.likesCount, hasLiked: response.hasLiked };
  } catch (error: any) {
    console.error("Error unliking post:", error);
    throw error;
  }
};

export const commentOnPost = async (postId: string, content: string, userId: string): Promise<FeedComment> => {
  try {
    const response = await api.addComment(postId, content);
    const comment = response.comment;
    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.user.id,
        name: comment.user.name,
        image: comment.user.image
      },
      createdAt: new Date(comment.createdAt),
      postId
    };
  } catch (error: any) {
    toast.error(error.message || "Failed to add comment");
    throw error;
  }
};

export const getTrendingTopics = async (): Promise<string[]> => {
  return ["JavaScript", "React", "TypeScript", "Tailwind", "NextJS"];
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    await api.deletePost(postId);
    toast.success("Post deleted successfully");
  } catch (error: any) {
    console.error("Error deleting post:", error);
    toast.error(error.message || "Failed to delete post");
    throw error;
  }
};

export const getLearningChallenges = async () => {
  return [
    { id: 'c1', title: 'Array Manipulation Challenge', difficulty: 'Medium', url: '/learning?challenge=c1' },
    { id: 'c2', title: 'React State Management Problem', difficulty: 'Hard', url: '/learning?challenge=c2' },
    { id: 'c3', title: 'CSS Layout Puzzle', difficulty: 'Easy', url: '/learning?challenge=c3' }
  ];
};

export const getTutorialVideos = async () => {
  return [
    { id: 'v1', title: 'React Hooks Deep Dive', duration: '15:45', url: '/learning?video=v1' },
    { id: 'v2', title: 'CSS Grid Layout Tutorial', duration: '8:30', url: '/learning?video=v2' }
  ];
};
