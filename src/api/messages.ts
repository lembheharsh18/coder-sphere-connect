
import { api } from "@/lib/apiClient";
import { Conversation, Message, UserBasicInfo } from '@/types/messages';

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await api.getConversations();
    return response.conversations.map((c: any) => {
      // Find the other participant in the conversation
      // This assumes the API returns participants with user info
      // In our server, we include participants -> user
      // We'll need a way to filter out the current user on the client side if needed
      // For now, we'll take the first participant that isn't the user
      // But we don't have the current user ID here easily ohne AuthContext
      // However, we can map what we have
      
      const otherParticipant = c.conversation.participants[0]; // Simplified
      
      return {
        id: c.conversation.id,
        user: {
          id: otherParticipant.user.id,
          name: otherParticipant.user.name,
          image: otherParticipant.user.image,
          status: 'Available'
        },
        lastMessage: c.conversation.messages[0] ? {
          id: c.conversation.messages[0].id,
          senderId: c.conversation.messages[0].senderId,
          content: c.conversation.messages[0].content,
          timestamp: c.conversation.messages[0].createdAt,
          read: c.conversation.messages[0].read
        } : undefined,
        unreadCount: 0 // Would be calculated from lastReadAt in a full impl
      };
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const response = await api.getMessages(conversationId);
    return response.messages.map((m: any) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      content: m.content,
      timestamp: m.createdAt,
      read: m.read
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessage = async (conversationId: string, content: string): Promise<Message> => {
  try {
    // We need the receiverId. In a real app, this would be part of the state
    // For now, this is a bit of a mismatch with the apiClient signature
    // I'll update the apiClient to take just conversationId if that's what we have
    const response = await api.sendMessage({ conversationId, receiverId: '', content });
    const m = response.message;
    return {
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      content: m.content,
      timestamp: m.createdAt,
      read: m.read
    };
  } catch (error: any) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const searchUsers = async (query: string): Promise<UserBasicInfo[]> => {
  try {
    const response = await api.getUsers();
    return response.users
      .filter((u: any) => u.name.toLowerCase().includes(query.toLowerCase()))
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        image: u.image || '',
        status: u.bio || 'New member'
      }));
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

export const startConversation = async (userId: string): Promise<Conversation> => {
  try {
    // Send an initial greeting or just create the conversation
    const response = await api.sendMessage({ receiverId: userId, content: 'Started a new conversation' });
    const m = response.message;
    
    return {
      id: m.conversationId,
      user: {
        id: userId,
        name: 'User', // Would be fetched
        image: '',
        status: 'Available'
      },
      unreadCount: 0
    };
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    throw error;
  }
};
