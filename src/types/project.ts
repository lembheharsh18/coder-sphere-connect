
export interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl?: string;
  demoUrl?: string;
  userId: string;
  collaborators: string[];
  createdAt: string;
  updatedAt: string;
}
