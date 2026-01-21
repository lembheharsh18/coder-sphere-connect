import React, { useEffect } from 'react';
import { useSocket, ConnectionNotification, SocketMessage } from '@/contexts/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/lib/apiClient';

interface RealTimeNotificationsProps {
  onConnectionRequest?: (notification: ConnectionNotification) => void;
  onNewMessage?: (message: SocketMessage) => void;
}

const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({ 
  onConnectionRequest,
  onNewMessage
}) => {
  const { onConnectionNotification, onNewMessage: onSocketMessage, isConnected } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle connection notifications
  useEffect(() => {
    if (!isConnected) return;

    const handleConnectionNotification = (notification: ConnectionNotification) => {
      // Call the parent callback if provided
      onConnectionRequest?.(notification);

      if (notification.type === 'connection_request') {
        toast({
          title: "New Connection Request",
          description: (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                {notification.fromUser.image ? (
                  <img 
                    src={notification.fromUser.image} 
                    alt={notification.fromUser.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                )}
                <span className="font-medium">{notification.fromUser.name}</span>
                <span className="text-muted-foreground">wants to connect</span>
              </div>
            </div>
          ),
          action: (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/notifications')}
              >
                View
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await api.updateConnection(notification.connectionId, 'ACCEPTED');
                    toast({
                      title: "Connected!",
                      description: `You are now connected with ${notification.fromUser.name}`,
                    });
                  } catch (error) {
                    toast({
                      title: "Failed to accept",
                      description: "Could not accept the connection request",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Accept
              </Button>
            </div>
          ),
          duration: 10000, // 10 seconds for connection requests
        });
      } else if (notification.type === 'connection_accepted') {
        toast({
          title: "Connection Accepted!",
          description: (
            <div className="flex items-center gap-2">
              {notification.fromUser.image ? (
                <img 
                  src={notification.fromUser.image} 
                  alt={notification.fromUser.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              )}
              <span>
                <span className="font-medium">{notification.fromUser.name}</span>
                {' '}accepted your connection request
              </span>
            </div>
          ),
          action: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/profile/${notification.fromUser.id}`)}
            >
              View Profile
            </Button>
          ),
          duration: 8000,
        });
      }
    };

    const cleanup = onConnectionNotification(handleConnectionNotification);
    return cleanup;
  }, [isConnected, onConnectionNotification, toast, navigate, onConnectionRequest]);

  // Handle new message notifications (only show if not on messages page)
  useEffect(() => {
    if (!isConnected) return;

    const handleNewMessage = (message: SocketMessage) => {
      // Call the parent callback if provided
      onNewMessage?.(message);

      // Only show notification if not on messages page
      if (!location.pathname.startsWith('/messages')) {
        toast({
          title: "New Message",
          description: (
            <div className="flex items-center gap-2">
              {message.sender.image ? (
                <img 
                  src={message.sender.image} 
                  alt={message.sender.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{message.sender.name}</p>
                <p className="text-sm text-muted-foreground truncate">{message.content}</p>
              </div>
            </div>
          ),
          action: (
            <Button
              size="sm"
              onClick={() => navigate('/messages')}
            >
              Reply
            </Button>
          ),
          duration: 5000,
        });
      }
    };

    const cleanup = onSocketMessage(handleNewMessage);
    return cleanup;
  }, [isConnected, onSocketMessage, toast, navigate, location.pathname, onNewMessage]);

  // This component doesn't render anything visible
  return null;
};

export default RealTimeNotifications;
