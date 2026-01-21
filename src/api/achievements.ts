
import { api } from "@/lib/apiClient";
import { Badge } from '@/types/badge';

export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const response = await api.request<any>('/api/badges');
    return response.badges.filter((b: any) => b.userId === userId);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return [];
  }
};

export const addBadge = async (badge: Omit<Badge, 'id'>): Promise<Badge> => {
  try {
    const response = await api.request<any>('/api/badges', {
      method: 'POST',
      body: JSON.stringify(badge)
    });
    return response.badge;
  } catch (error: any) {
    console.error("Error adding badge:", error);
    throw error;
  }
};

export const deleteBadge = async (id: string, userId: string): Promise<void> => {
  try {
    await api.request(`/api/badges/${id}`, { method: 'DELETE' });
  } catch (error: any) {
    console.error("Error deleting badge:", error);
    throw error;
  }
};

export const getUserPoints = async (userId: string): Promise<number> => {
  try {
    const badges = await getUserBadges(userId);
    return badges.reduce((total: number, badge: Badge) => total + (badge.points || 0), 0);
  } catch (error) {
    console.error("Error calculating user points:", error);
    return 0;
  }
};
