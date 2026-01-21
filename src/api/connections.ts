
import { api } from "@/lib/apiClient";
import { Connection } from '@/types/messages';

export const getUserConnections = async (userId: string): Promise<Connection[]> => {
  try {
    const response = await api.getConnections();
    return response.connections.map(conn => {
      // In our server response, it includes user and connectedUser
      // We need to determine which one is 'the other user'
      const otherUser = conn.userId === userId ? conn.connectedUser : conn.user;
      
      return {
        id: otherUser.id,
        name: otherUser.name || 'Unknown User',
        role: otherUser.role || 'Member',
        image: otherUser.image || null,
        mutualConnections: 0
      };
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return [];
  }
};

export const connectUser = async (targetUserId: string, currentUserId?: string): Promise<void> => {
  try {
    await api.sendConnectionRequest(targetUserId);
  } catch (error: any) {
    console.error("Error connecting with user:", error);
    throw error;
  }
};

export const acceptConnectionRequest = async (requesterId: string, currentUserId: string): Promise<void> => {
  try {
    // We need the connection ID, but we only have requesterId
    // We'll fetch pending connections first to find the ID
    const pending = await api.getConnections(); // This should return all, we filter on client or update backend
    const connection = pending.connections.find(c => c.userId === requesterId && c.connectedUserId === currentUserId);
    
    if (connection) {
      await api.updateConnection(connection.id, 'ACCEPTED');
    }
  } catch (error: any) {
    console.error("Error accepting connection request:", error);
    throw error;
  }
};

export const getPendingConnections = async (userId: string): Promise<{id: string, name: string, image: string | null}[]> => {
  try {
    const response = await api.getConnections();
    return response.connections
      .filter(c => c.connectedUserId === userId && c.status === 'PENDING')
      .map(c => ({
        id: c.user.id,
        name: c.user.name || 'Unknown User',
        image: c.user.image
      }));
  } catch (error) {
    console.error("Error fetching pending connections:", error);
    return [];
  }
};
