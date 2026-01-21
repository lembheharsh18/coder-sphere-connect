
import React, { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, MessageSquare, Circle } from 'lucide-react';
import { getConversations } from '@/api/messages';
import { Conversation } from '@/types/messages';
import { useToast } from '@/hooks/use-toast';
import { useSocket, SocketMessage } from '@/contexts/SocketContext';
import NewMessageDialog from './NewMessageDialog';

interface ConversationsListProps {
  activeConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationsList = ({ activeConversationId, onSelectConversation }: ConversationsListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const { toast } = useToast();
  const { onlineUsers, onNewMessage } = useSocket();
  
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
        
        // Set the first conversation as active if none is selected
        if (!activeConversationId && data.length > 0) {
          onSelectConversation(data[0]);
        }
      } catch (error) {
        toast({
          title: "Error loading conversations",
          description: "Failed to load your conversations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, [activeConversationId, onSelectConversation, toast]);
  
  // Listen for new messages to update conversation list
  const handleNewSocketMessage = useCallback((message: SocketMessage) => {
    setConversations(prev => {
      const conversationIndex = prev.findIndex(c => c.id === message.conversationId);
      
      if (conversationIndex === -1) return prev;
      
      const updatedConversations = [...prev];
      const conversation = { ...updatedConversations[conversationIndex] };
      
      // Update last message
      conversation.lastMessage = {
        content: message.content,
        timestamp: message.createdAt,
        senderId: message.senderId,
      };
      
      // Increment unread count if this conversation is not active
      if (message.conversationId !== activeConversationId) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
      
      // Remove from current position and add to top
      updatedConversations.splice(conversationIndex, 1);
      return [conversation, ...updatedConversations];
    });
  }, [activeConversationId]);
  
  useEffect(() => {
    const cleanup = onNewMessage(handleNewSocketMessage);
    return cleanup;
  }, [onNewMessage, handleNewSocketMessage]);
  
  // Reset unread count when conversation becomes active
  useEffect(() => {
    if (activeConversationId) {
      setConversations(prev => 
        prev.map(c => 
          c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  }, [activeConversationId]);
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleNewMessage = (newConversation: Conversation) => {
    setConversations(prev => [newConversation, ...prev]);
    onSelectConversation(newConversation);
    setShowNewMessageDialog(false);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Messages</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="icon" onClick={() => setShowNewMessageDialog(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="font-medium">No conversations</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery ? "No results found" : "Start messaging with other developers"}
            </p>
            <Button onClick={() => setShowNewMessageDialog(true)}>
              Start a New Conversation
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const lastMessage = conversation.lastMessage;
              const isOnline = onlineUsers.has(conversation.user.id);
              
              return (
                <li 
                  key={conversation.id} 
                  className={`cursor-pointer hover:bg-muted/50 ${isActive ? 'bg-muted' : ''}`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.user.image || undefined} alt={conversation.user.name} />
                        <AvatarFallback>{conversation.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      <Circle 
                        className={`absolute bottom-0 right-0 h-3 w-3 ${
                          isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className={`font-medium truncate ${conversation.unreadCount > 0 ? 'font-bold' : ''}`}>
                          {conversation.user.name}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      <NewMessageDialog
        open={showNewMessageDialog}
        onOpenChange={setShowNewMessageDialog}
        onNewConversation={handleNewMessage}
      />
    </div>
  );
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString();
};

export default ConversationsList;
