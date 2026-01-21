
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Phone, Video, MoreHorizontal, SendHorizontal, MessageCircle, User, Circle } from 'lucide-react';
import { Conversation, Message } from '@/types/messages';
import { getMessages, sendMessage as sendMessageApi } from '@/api/messages';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket, SocketMessage, TypingIndicator } from '@/contexts/SocketContext';

interface MessageThreadProps {
  conversation: Conversation | null;
}

const MessageThread: React.FC<MessageThreadProps> = ({ conversation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    isConnected, 
    onlineUsers, 
    joinConversation, 
    leaveConversation, 
    sendMessage: sendSocketMessage,
    sendTypingIndicator,
    markMessagesAsRead,
    onNewMessage, 
    onTyping,
    onMessagesRead
  } = useSocket();
  
  // Join conversation room when conversation changes
  useEffect(() => {
    if (conversation && isConnected) {
      joinConversation(conversation.id);
      
      return () => {
        leaveConversation(conversation.id);
      };
    }
  }, [conversation?.id, isConnected, joinConversation, leaveConversation]);
  
  // Load messages initially
  useEffect(() => {
    if (conversation) {
      setIsLoading(true);
      getMessages(conversation.id)
        .then(data => {
          setMessages(data);
          setTimeout(() => scrollToBottom(), 100);
          
          // Mark unread messages as read
          const unreadMessageIds = data
            .filter((m: Message) => m.senderId !== user?.id && !m.read)
            .map((m: Message) => m.id);
          
          if (unreadMessageIds.length > 0 && isConnected) {
            markMessagesAsRead(conversation.id, unreadMessageIds);
          }
        })
        .catch(() => {
          toast({
            title: "Error loading messages",
            description: "Failed to load messages. Please try again.",
            variant: "destructive",
          });
        })
        .finally(() => setIsLoading(false));
    } else {
      setMessages([]);
    }
  }, [conversation, toast, user?.id, isConnected, markMessagesAsRead]);
  
  // Listen for new messages via Socket.io
  useEffect(() => {
    if (!conversation) return;
    
    const handleNewMessage = (socketMessage: SocketMessage) => {
      if (socketMessage.conversationId === conversation.id) {
        const newMsg: Message = {
          id: socketMessage.id,
          content: socketMessage.content,
          senderId: socketMessage.senderId,
          timestamp: socketMessage.createdAt,
          read: socketMessage.senderId === user?.id,
        };
        
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMsg.id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
        
        // Auto-scroll and mark as read
        setTimeout(() => {
          scrollToBottom();
          if (socketMessage.senderId !== user?.id) {
            markMessagesAsRead(conversation.id, [socketMessage.id]);
          }
        }, 100);
        
        // Clear typing indicator
        setTypingUser(null);
      }
    };
    
    const cleanup = onNewMessage(handleNewMessage);
    return cleanup;
  }, [conversation, onNewMessage, user?.id, markMessagesAsRead]);
  
  // Listen for typing indicators
  useEffect(() => {
    if (!conversation) return;
    
    const handleTyping = (data: TypingIndicator) => {
      if (data.conversationId === conversation.id && data.userId !== user?.id) {
        if (data.isTyping) {
          setTypingUser(data.userName);
        } else {
          setTypingUser(null);
        }
      }
    };
    
    const cleanup = onTyping(handleTyping);
    return cleanup;
  }, [conversation, onTyping, user?.id]);
  
  // Listen for read receipts
  useEffect(() => {
    if (!conversation) return;
    
    const handleMessagesRead = (data: { conversationId: string; messageIds: string[]; readBy: string }) => {
      if (data.conversationId === conversation.id) {
        setMessages(prev => prev.map(msg => 
          data.messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        ));
      }
    };
    
    const cleanup = onMessagesRead(handleMessagesRead);
    return cleanup;
  }, [conversation, onMessagesRead]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle typing with debounce
  const handleTypingChange = useCallback((value: string) => {
    setNewMessage(value);
    
    if (!conversation || !isConnected) return;
    
    // Send typing indicator
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      sendTypingIndicator(conversation.id, true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(conversation.id, false);
      }
    }, 2000);
  }, [conversation, isConnected, isTyping, sendTypingIndicator]);
  
  const handleSendMessage = async () => {
    if (!conversation || !newMessage.trim() || !user) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(conversation.id, false);
    }
    
    // Use Socket.io if connected, fallback to REST API
    if (isConnected) {
      sendSocketMessage(conversation.id, messageContent);
    } else {
      try {
        const sentMessage = await sendMessageApi(conversation.id, messageContent);
        setMessages(prev => [...prev, sentMessage]);
        setTimeout(() => scrollToBottom(), 100);
      } catch (error) {
        toast({
          title: "Failed to send message",
          description: "Your message couldn't be sent. Please try again.",
          variant: "destructive",
        });
        setNewMessage(messageContent); // Restore message on failure
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Check if the other user is online
  const isOtherUserOnline = conversation ? onlineUsers.has(conversation.user.id) : false;
  
  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Select a conversation from the list or start a new one to begin messaging
        </p>
        <Button>Start a New Conversation</Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={conversation.user.image || undefined} alt={conversation.user.name} />
              <AvatarFallback>{conversation.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <Circle 
              className={`absolute bottom-0 right-0 h-3 w-3 ${
                isOtherUserOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'
              }`}
            />
          </div>
          <div>
            <h2 className="font-semibold">{conversation.user.name}</h2>
            <p className="text-xs text-muted-foreground">
              {typingUser ? (
                <span className="text-primary animate-pulse">typing...</span>
              ) : isOtherUserOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                conversation.user.status || 'Offline'
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Video className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <User className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="font-medium">No messages yet</h3>
            <p className="text-sm text-muted-foreground">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === user?.id;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={conversation.user.image || undefined}
                          alt={conversation.user.name} 
                        />
                        <AvatarFallback>
                          {conversation.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`rounded-2xl p-3 ${
                        isCurrentUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs opacity-70">
                            {message.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {typingUser && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={conversation.user.image || undefined}
                      alt={conversation.user.name} 
                    />
                    <AvatarFallback>
                      {conversation.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Connection status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs text-center">
          Connecting to real-time messaging...
        </div>
      )}
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            className="min-h-[50px] max-h-32"
            value={newMessage}
            onChange={(e) => handleTypingChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button 
            className="self-end" 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
