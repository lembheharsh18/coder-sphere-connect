
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

export interface UserAchievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  category: string;
  imageUrl?: string;
  url?: string;
}

export const addUserAchievement = async (
  userId: string,
  achievementData: Omit<UserAchievement, 'id' | 'userId'>
): Promise<UserAchievement> => {
  try {
    const response = await api.request<any>('/api/badges', {
      method: 'POST',
      body: JSON.stringify({
        ...achievementData,
        userId,
        name: achievementData.title, // Map title to name for backend
        earnedDate: achievementData.date
      })
    });
    
    const b = response.badge;
    return {
      id: b.id,
      userId: b.userId,
      title: b.name,
      description: b.description || '',
      date: b.earnedDate,
      category: 'General',
      imageUrl: b.image
    };
  } catch (error: any) {
    console.error("Error adding achievement:", error);
    toast.error("Failed to add achievement");
    throw error;
  }
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const response = await api.request<any>('/api/badges');
    return response.badges
      .filter((b: any) => b.userId === userId)
      .map((b: any) => ({
        id: b.id,
        userId: b.userId,
        title: b.name,
        description: b.description || '',
        date: b.earnedDate,
        category: 'General',
        imageUrl: b.image
      }));
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return [];
  }
};

export const deleteUserAchievement = async (achievementId: string, userId: string): Promise<void> => {
  try {
    await api.request(`/api/badges/${achievementId}`, { method: 'DELETE' });
  } catch (error: any) {
    console.error("Error deleting achievement:", error);
    toast.error("Failed to delete achievement");
    throw error;
  }
};
