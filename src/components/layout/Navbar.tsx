
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, MessageSquare, Search, Wifi, WifiOff } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import NavbarUserSection from './NavbarUserSection';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket, SocketMessage } from '@/contexts/SocketContext';
import ContestNotification from '../contests/ContestNotification';
import { getContests } from '@/api/contests';
import { Contest } from '@/types/contest';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { isConnected, onNewMessage } = useSocket();
  const location = useLocation();
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchContests = async () => {
      if (isAuthenticated) {
        try {
          const contests = await getContests();
          setUpcomingContests(contests);
        } catch (error) {
          console.error('Error fetching contests for notifications:', error);
        }
      }
    };

    fetchContests();
  }, [isAuthenticated]);

  // Listen for new messages to update unread count
  const handleNewMessage = useCallback((message: SocketMessage) => {
    // Only increment if not on messages page
    if (!location.pathname.startsWith('/messages')) {
      setUnreadCount(prev => prev + 1);
    }
  }, [location.pathname]);

  useEffect(() => {
    const cleanup = onNewMessage(handleNewMessage);
    return cleanup;
  }, [onNewMessage, handleNewMessage]);

  // Reset unread count when visiting messages page
  useEffect(() => {
    if (location.pathname.startsWith('/messages')) {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center px-4">
        <SidebarTrigger className="mr-2 md:hidden" />
        <div className="flex w-full justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden items-center space-x-2 md:flex">
              <span className="font-bold text-xl text-primary">
                CoderSphere
              </span>
            </Link>
            <div className="relative hidden md:flex md:w-80 lg:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                {/* Connection status indicator */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`p-2 rounded-full ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {isConnected ? (
                        <Wifi className="h-4 w-4" />
                      ) : (
                        <WifiOff className="h-4 w-4" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isConnected ? 'Real-time connected' : 'Connecting...'}
                  </TooltipContent>
                </Tooltip>
                
                <ContestNotification upcomingContests={upcomingContests} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  asChild
                >
                  <Link to="/messages">
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    {unreadCount === 0 && (
                      <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-muted-foreground/30"></span>
                    )}
                  </Link>
                </Button>
              </>
            )}
            <NavbarUserSection />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
