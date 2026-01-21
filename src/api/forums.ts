
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

export interface Forum {
  id: string;
  title: string;
  description: string;
  postCount: number;
  createdAt?: Date;
  userId?: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  forumId: string;
  user?: {
    name: string;
    image?: string | null;
  };
}

export async function getForums(): Promise<Forum[]> {
  try {
    const response = await api.getForums();
    return response.forums.map((f: any) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      postCount: f._count?.posts || 0,
      createdAt: new Date(f.createdAt),
      userId: f.userId
    }));
  } catch (error) {
    console.error("Error fetching forums:", error);
    return [];
  }
}

export async function getForum(forumId: string): Promise<Forum | null> {
  try {
    const forums = await getForums();
    return forums.find(f => f.id === forumId) || null;
  } catch (error) {
    console.error("Error fetching forum:", error);
    return null;
  }
}

export async function getForumPosts(forumId: string): Promise<ForumPost[]> {
  try {
    const response = await api.getForumPosts(forumId);
    return response.posts.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return [];
  }
}

export interface CreateForumData {
  title: string;
  description: string;
  userId: string;
}

export async function createForum(data: CreateForumData): Promise<Forum> {
  try {
    const response = await api.createForum(data.title, data.description);
    const f = response.forum;
    toast.success("Forum created successfully");
    return {
      id: f.id,
      title: f.title,
      description: f.description,
      postCount: 0,
      createdAt: new Date(f.createdAt),
      userId: f.userId
    };
  } catch (error: any) {
    toast.error(error.message || "Failed to create forum");
    throw error;
  }
}

export interface CreateForumPostData {
  title: string;
  content: string;
  userId: string;
  forumId: string;
  userName?: string;
  userImage?: string | null;
}

export async function createForumPost(data: CreateForumPostData): Promise<ForumPost> {
  try {
    const response = await api.createForumPost(data.forumId, data.title, data.content);
    const p = response.post;
    toast.success("Post created successfully");
    return {
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    };
  } catch (error: any) {
    toast.error(error.message || "Failed to create post");
    throw error;
  }
}
