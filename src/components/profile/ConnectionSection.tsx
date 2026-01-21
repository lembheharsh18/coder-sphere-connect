
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MessageCircle, User, Bell, Check, X } from 'lucide-react';
import { getUserConnections, connectUser, getPendingConnections, acceptConnectionRequest } from '@/api/connections';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { startConversation } from '@/api/messages';
import { Connection } from '@/types/messages';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionProps {
  userId: string;
  isCurrentUser: boolean;
}

const ConnectionSection = ({ userId, isCurrentUser }: ConnectionProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<{id: string, name: string, image: string | null}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const connectionsData = await getUserConnections(userId);
      setConnections(connectionsData);
      
      // Fetch pending connections only if viewing own profile
      if (isCurrentUser && user) {
        const pendingData = await getPendingConnections(user.id);
        setPendingConnections(pendingData);
      }
    } catch (error) {
      toast({
        title: "Failed to load connections",
        description: "Unable to load user connections. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, isCurrentUser, user, toast]);

  const handleConnect = async () => {
    if (isConnecting || !user) return;
    
    setIsConnecting(true);
    try {
      await connectUser(userId, user.id);
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to send request",
        description: "Unable to send connection request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = async () => {
    if (!user) return;
    
    try {
      const conversation = await startConversation(userId);
      navigate('/messages', { state: { conversationId: conversation.id } });
    } catch (error) {
      toast({
        title: "Failed to start conversation",
        description: "Unable to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requesterId: string) => {
    if (!user) return;
    
    try {
      await acceptConnectionRequest(requesterId, user.id);
      toast({
        title: "Connection accepted",
        description: "You are now connected.",
      });
      
      // Refresh data
      fetchData();
    } catch (error) {
      toast({
        title: "Failed to accept request",
        description: "Unable to accept connection request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineRequest = async (requesterId: string) => {
    // Remove from pending connections UI immediately
    setPendingConnections(pendingConnections.filter(conn => conn.id !== requesterId));
    
    toast({
      title: "Connection declined",
      description: "Connection request has been declined.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">
          {isCurrentUser ? 'My Connections' : 'Connections'}
        </CardTitle>
        {!isCurrentUser && user && user.id !== userId && (
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handleMessage}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button size="sm" onClick={handleConnect} disabled={isConnecting}>
              <User className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isCurrentUser && pendingConnections.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Pending Requests ({pendingConnections.length})
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {pendingConnections.map((conn) => (
                <div key={conn.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={conn.image || undefined} alt={conn.name} />
                      <AvatarFallback>{conn.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{conn.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleDeclineRequest(conn.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleAcceptRequest(conn.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading connections...</div>
        ) : connections.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {isCurrentUser ? "You don't have any connections yet." : "No connections to display."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center gap-3 p-2 border rounded-md">
                <Avatar>
                  <AvatarImage src={connection.image || undefined} alt={connection.name} />
                  <AvatarFallback>{connection.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Link to={`/profile/${connection.id}`} className="font-medium hover:underline truncate block">
                    {connection.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    {connection.role && <Badge variant="outline">{connection.role}</Badge>}
                    {connection.mutualConnections > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {connection.mutualConnections} mutual
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {connections.length > 0 && (
          <div className="text-center mt-4">
            <Button variant="ghost" size="sm">
              View All Connections
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionSection;
