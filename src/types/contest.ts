
export interface Contest {
  id: string;
  name: string;
  platform: string;
  startTime: string;
  endTime: string;
  url: string;
  description: string;
}

export interface ContestDiscussion {
  id: string;
  contestId: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  createdAt: string;
  comments?: ContestComment[];
}

export interface ContestComment {
  id: string;
  discussionId: string;
  content: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  createdAt: string;
}

export interface CodeSolution {
  id: string;
  contestId: string;
  problemNumber?: string;
  title: string;
  code: string;
  language: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface CodeComment {
  id: string;
  solutionId: string;
  content: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  createdAt: string;
}
