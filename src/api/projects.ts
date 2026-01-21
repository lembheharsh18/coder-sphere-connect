
import { api } from "@/lib/apiClient";
import { Project } from '@/types/project';
import { toast } from 'sonner';

export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    const response = await api.getProjects();
    return response.projects
      .filter((p: any) => p.userId === userId)
      .map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt).toISOString(),
        updatedAt: new Date(p.updatedAt).toISOString()
      }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const getCollaboratorProjects = async (userId: string): Promise<Project[]> => {
  try {
    const response = await api.getProjects();
    return response.projects
      .filter((p: any) => p.collaborators && p.collaborators.includes(userId))
      .map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt).toISOString(),
        updatedAt: new Date(p.updatedAt).toISOString()
      }));
  } catch (error) {
    console.error("Error fetching collaborator projects:", error);
    return [];
  }
};

export const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
  try {
    const response = await api.createProject(project);
    const p = response.project;
    return {
      ...p,
      createdAt: new Date(p.createdAt).toISOString(),
      updatedAt: new Date(p.updatedAt).toISOString()
    };
  } catch (error: any) {
    toast.error(error.message || "Failed to add project");
    throw error;
  }
};

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
  try {
    const response = await api.request<any>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
    return response.project;
  } catch (error: any) {
    toast.error(error.message || "Failed to update project");
    throw error;
  }
};

export const addCollaborator = async (projectId: string, userId: string, collaboratorId: string): Promise<Project> => {
  // Mocking this as a PUT update on backend for now
  return updateProject(projectId, { collaborators: [collaboratorId] } as any);
};

export const removeCollaborator = async (projectId: string, userId: string, collaboratorId: string): Promise<Project> => {
  // Mocking this as a PUT update on backend for now
  return updateProject(projectId, { collaborators: [] } as any); // Simplified
};

export const deleteProject = async (id: string, userId: string): Promise<void> => {
  try {
    await api.request(`/api/projects/${id}`, { method: 'DELETE' });
  } catch (error: any) {
    toast.error(error.message || "Failed to delete project");
    throw error;
  }
};
