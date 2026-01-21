
export interface UserBasicInfo {
  id: string;
  name: string;
  image?: string;
  status?: string;
}

export interface MessagePreview {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  user: UserBasicInfo;
  lastMessage?: MessagePreview;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Connection {
  id: string;
  name: string;
  image?: string;
  role?: string;
  mutualConnections?: number;
}
