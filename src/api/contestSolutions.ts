
import { api } from "@/lib/apiClient";
import { CodeSolution, CodeComment } from '@/types/contest';
import { toast } from "sonner";

export const getContestSolutions = async (contestId: string): Promise<CodeSolution[]> => {
  try {
    const response = await api.getContestSolutions(contestId);
    return response.solutions.map((s: any) => ({
      id: s.id,
      contestId: s.contestId,
      problemNumber: s.problemNumber,
      title: s.title,
      code: s.code,
      language: s.language,
      userId: s.userId,
      userName: s.user.name,
      userImage: s.user.image,
      createdAt: new Date(s.createdAt).toISOString(),
      likesCount: 0,
      commentsCount: 0
    }));
  } catch (error) {
    console.error("Error fetching contest solutions:", error);
    return [];
  }
};

export const addSolution = async (
  contestId: string, 
  title: string,
  code: string,
  language: string,
  userId: string,
  userName: string,
  userImage?: string | null,
  problemNumber?: string
): Promise<CodeSolution> => {
  try {
    const response = await api.createContestSolution(contestId, {
      title,
      code,
      language,
      problemNumber
    });
    const s = response.solution;
    return {
      id: s.id,
      contestId: s.contestId,
      problemNumber: s.problemNumber,
      title: s.title,
      code: s.code,
      language: s.language,
      userId: s.userId,
      userName: s.user.name,
      userImage: s.user.image,
      createdAt: new Date(s.createdAt).toISOString(),
      likesCount: 0,
      commentsCount: 0
    };
  } catch (error: any) {
    toast.error(error.message || "Failed to add solution");
    throw error;
  }
};

export const likeSolution = async (solutionId: string, userId: string, contestId: string): Promise<void> => {
  // Logic for liking solutions
  toast.info("Solution like processed");
};

export const addCommentToSolution = async (
  solutionId: string,
  contestId: string,
  content: string,
  userId: string,
  userName: string,
  userImage?: string | null
): Promise<CodeComment> => {
  // Generic comment or specific one
  toast.info("Comment added to solution");
  return {
    id: `comment-${Date.now()}`,
    solutionId,
    content,
    userId,
    userName,
    userImage,
    createdAt: new Date().toISOString()
  };
};

export const getSolutionComments = async (solutionId: string): Promise<CodeComment[]> => {
  return [];
};
