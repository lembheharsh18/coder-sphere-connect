
export interface FeedPost {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
    image?: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  hasLiked?: boolean;
  media?: {
    type: 'image' | 'video';
    url: string;
  }[];
  // Project collaboration fields
  type?: 'project_created' | 'collaboration_added' | 'general';
  projectId?: string;
  collaboratorId?: string;
  // Comment functionality
  commentsList?: FeedComment[];
}

export interface FeedComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: Date;
  postId: string;
}
