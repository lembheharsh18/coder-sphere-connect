import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Types for Socket events
export interface SocketMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface ConnectionNotification {
  type: 'connection_request' | 'connection_accepted';
  fromUser: {
    id: string;
    name: string;
    image: string | null;
  };
  connectionId: string;
  createdAt: string;
}

export interface OnlineStatusChange {
  userId: string;
  isOnline: boolean;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  
  // Messaging
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  markMessagesAsRead: (conversationId: string, messageIds: string[]) => void;
  
  // Event subscriptions
  onNewMessage: (callback: (message: SocketMessage) => void) => () => void;
  onTyping: (callback: (data: TypingIndicator) => void) => () => void;
  onMessagesRead: (callback: (data: { conversationId: string; messageIds: string[]; readBy: string }) => void) => () => void;
  onConnectionNotification: (callback: (notification: ConnectionNotification) => void) => () => void;
  onOnlineStatusChange: (callback: (data: OnlineStatusChange) => void) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Optional hook for components that may not be within provider
export const useSocketOptional = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3001' : ''), {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Authenticate with the server
      newSocket.emit('authenticate', token);
    });

    newSocket.on('authenticated', (data: { userId: string; onlineUsers: string[] }) => {
      console.log('✅ Socket authenticated for user:', data.userId);
      setOnlineUsers(new Set(data.onlineUsers));
    });

    newSocket.on('authError', (error: { message: string }) => {
      console.error('❌ Socket auth error:', error.message);
      newSocket.disconnect();
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsConnected(false);
    });

    // User online status updates
    newSocket.on('userOnline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('userOffline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  // Messaging functions
  const joinConversation = useCallback((conversationId: string) => {
    if (socket?.connected) {
      socket.emit('joinConversation', conversationId);
      console.log('📥 Joined conversation:', conversationId);
    }
  }, [socket]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket?.connected) {
      socket.emit('leaveConversation', conversationId);
      console.log('📤 Left conversation:', conversationId);
    }
  }, [socket]);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (socket?.connected) {
      socket.emit('sendMessage', { conversationId, content });
    }
  }, [socket]);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket?.connected) {
      socket.emit('typing', { conversationId, isTyping });
    }
  }, [socket]);

  const markMessagesAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    if (socket?.connected) {
      socket.emit('markAsRead', { conversationId, messageIds });
    }
  }, [socket]);

  // Event subscription helpers - return cleanup functions
  const onNewMessage = useCallback((callback: (message: SocketMessage) => void) => {
    if (!socket) return () => {};
    socket.on('newMessage', callback);
    return () => socket.off('newMessage', callback);
  }, [socket]);

  const onTyping = useCallback((callback: (data: TypingIndicator) => void) => {
    if (!socket) return () => {};
    socket.on('typing', callback);
    return () => socket.off('typing', callback);
  }, [socket]);

  const onMessagesRead = useCallback((callback: (data: { conversationId: string; messageIds: string[]; readBy: string }) => void) => {
    if (!socket) return () => {};
    socket.on('messagesRead', callback);
    return () => socket.off('messagesRead', callback);
  }, [socket]);

  const onConnectionNotification = useCallback((callback: (notification: ConnectionNotification) => void) => {
    if (!socket) return () => {};
    socket.on('connectionNotification', callback);
    return () => socket.off('connectionNotification', callback);
  }, [socket]);

  const onOnlineStatusChange = useCallback((callback: (data: OnlineStatusChange) => void) => {
    if (!socket) return () => {};
    
    const handleOnline = ({ userId }: { userId: string }) => {
      callback({ userId, isOnline: true });
    };
    const handleOffline = ({ userId }: { userId: string }) => {
      callback({ userId, isOnline: false });
    };
    
    socket.on('userOnline', handleOnline);
    socket.on('userOffline', handleOffline);
    
    return () => {
      socket.off('userOnline', handleOnline);
      socket.off('userOffline', handleOffline);
    };
  }, [socket]);

  const value: SocketContextValue = {
    socket,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingIndicator,
    markMessagesAsRead,
    onNewMessage,
    onTyping,
    onMessagesRead,
    onConnectionNotification,
    onOnlineStatusChange,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
