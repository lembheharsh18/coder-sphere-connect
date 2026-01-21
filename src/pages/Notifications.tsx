
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Bell, MessageSquare, User, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getContests } from '@/api/contests';
import { Contest } from '@/types/contest';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow, isWithinInterval, addDays } from 'date-fns';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [allNotifications, setAllNotifications] = useState<{
    contests: Contest[];
    messages: { id: string; text: string; read: boolean; date: string }[];
    connections: { id: string; text: string; read: boolean; date: string }[];
    achievements: { id: string; text: string; read: boolean; date: string }[];
  }>({
    contests: [],
    messages: [],
    connections: [],
    achievements: []
  });

  useEffect(() => {
    // Fetch contests
    const fetchContests = async () => {
      try {
        const contests = await getContests();
        
        // Filter contests that are starting soon (within next 3 days)
        const now = new Date();
        const filteredContests = contests.filter(contest => {
          const startTime = new Date(contest.startTime);
          return isWithinInterval(startTime, {
            start: now,
            end: addDays(now, 3)
          });
        });
        
        setAllNotifications(prev => ({
          ...prev,
          contests: filteredContests
        }));
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };

    // Mock data for other notifications
    const mockMessages = [
      { id: '1', text: 'John sent you a new message', read: false, date: new Date().toISOString() },
      { id: '2', text: 'Sarah replied to your thread', read: true, date: new Date(Date.now() - 86400000).toISOString() }
    ];

    const mockConnections = [
      { id: '1', text: 'Alex wants to connect with you', read: false, date: new Date().toISOString() },
      { id: '2', text: 'You have 3 new connection suggestions', read: true, date: new Date(Date.now() - 172800000).toISOString() }
    ];

    const mockAchievements = [
      { id: '1', text: 'You earned the "Problem Solver" badge', read: false, date: new Date().toISOString() },
      { id: '2', text: 'You reached Level 5 in Algorithm Mastery', read: true, date: new Date(Date.now() - 259200000).toISOString() }
    ];

    setAllNotifications(prev => ({
      ...prev,
      messages: mockMessages,
      connections: mockConnections,
      achievements: mockAchievements
    }));

    fetchContests();
  }, []);

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const markAllAsRead = (type: string) => {
    setAllNotifications(prev => {
      if (type === 'all') {
        return {
          contests: prev.contests,
          messages: prev.messages.map(msg => ({ ...msg, read: true })),
          connections: prev.connections.map(conn => ({ ...conn, read: true })),
          achievements: prev.achievements.map(ach => ({ ...ach, read: true }))
        };
      } else if (type === 'messages') {
        return { ...prev, messages: prev.messages.map(msg => ({ ...msg, read: true })) };
      } else if (type === 'connections') {
        return { ...prev, connections: prev.connections.map(conn => ({ ...conn, read: true })) };
      } else if (type === 'achievements') {
        return { ...prev, achievements: prev.achievements.map(ach => ({ ...ach, read: true })) };
      }
      return prev;
    });
    toast({
      title: "Notifications marked as read",
      description: `All ${type === 'all' ? '' : type + ' '}notifications have been marked as read.`,
    });
  };

  const setContestReminder = (contestId: string, contestName: string) => {
    // In a real app, this would store the reminder in a database or local storage
    // For now, we'll just show a toast
    toast({
      title: "Reminder set",
      description: `You'll be reminded about ${contestName} before it starts.`,
    });
    
    // If localStorage is used for persistence:
    const reminders = JSON.parse(localStorage.getItem('contestReminders') || '{}');
    reminders[contestId] = true;
    localStorage.setItem('contestReminders', JSON.stringify(reminders));
  };

  const getTotalUnread = () => {
    return (
      allNotifications.messages.filter(m => !m.read).length +
      allNotifications.connections.filter(c => !c.read).length +
      allNotifications.achievements.filter(a => !a.read).length
    );
  };

  const getFormattedContestTime = (contest: Contest) => {
    const startTime = new Date(contest.startTime);
    if (isToday(startTime)) {
      return `Today at ${format(startTime, 'h:mm a')}`;
    } else if (isTomorrow(startTime)) {
      return `Tomorrow at ${format(startTime, 'h:mm a')}`;
    }
    return format(startTime, 'MMM d, h:mm a');
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with what's happening
            </p>
          </div>
          {getTotalUnread() > 0 && (
            <Button 
              variant="outline" 
              onClick={() => markAllAsRead('all')}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All
              {getTotalUnread() > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {getTotalUnread()}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contests">
              Contests
            </TabsTrigger>
            <TabsTrigger value="messages">
              Messages
              {allNotifications.messages.filter(m => !m.read).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {allNotifications.messages.filter(m => !m.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections">
              Connections
              {allNotifications.connections.filter(c => !c.read).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {allNotifications.connections.filter(c => !c.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="achievements">
              Achievements
              {allNotifications.achievements.filter(a => !a.read).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {allNotifications.achievements.filter(a => !a.read).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contest Notifications */}
                {allNotifications.contests.map(contest => (
                  <div key={contest.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="rounded-full p-2 bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <p className="font-medium">Upcoming Contest</p>
                          <p className="text-muted-foreground">{contest.name} on {contest.platform}</p>
                          <p className="text-sm text-muted-foreground">
                            Starts at {getFormattedContestTime(contest)}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setContestReminder(contest.id, contest.name)}
                          >
                            Set Reminder
                          </Button>
                          <Button size="sm" asChild>
                            <Link to={`/competitions`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Message Notifications */}
                {allNotifications.messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex items-start gap-4 p-4 rounded-lg border ${!message.read ? 'bg-accent/50' : ''}`}
                  >
                    <div className="rounded-full p-2 bg-blue-500/10">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <p>{message.text}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNotificationDate(message.date)}
                          </p>
                        </div>
                        <Button size="sm" asChild className="mt-2 sm:mt-0">
                          <Link to="/messages">View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Connection Notifications */}
                {allNotifications.connections.map(connection => (
                  <div 
                    key={connection.id} 
                    className={`flex items-start gap-4 p-4 rounded-lg border ${!connection.read ? 'bg-accent/50' : ''}`}
                  >
                    <div className="rounded-full p-2 bg-green-500/10">
                      <User className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <p>{connection.text}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNotificationDate(connection.date)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild className="mt-2 sm:mt-0">
                          <Link to="/profile">View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Achievement Notifications */}
                {allNotifications.achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`flex items-start gap-4 p-4 rounded-lg border ${!achievement.read ? 'bg-accent/50' : ''}`}
                  >
                    <div className="rounded-full p-2 bg-yellow-500/10">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <p>{achievement.text}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNotificationDate(achievement.date)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild className="mt-2 sm:mt-0">
                          <Link to="/achievements">View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {allNotifications.contests.length === 0 && 
                 allNotifications.messages.length === 0 && 
                 allNotifications.connections.length === 0 && 
                 allNotifications.achievements.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      You're all caught up! Check back later for updates.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contests">
            <Card>
              <CardHeader>
                <CardTitle>Contest Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {allNotifications.contests.length > 0 ? (
                  allNotifications.contests.map(contest => (
                    <div key={contest.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="rounded-full p-2 bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <p className="font-medium">Upcoming Contest</p>
                            <p className="text-muted-foreground">{contest.name} on {contest.platform}</p>
                            <p className="text-sm text-muted-foreground">
                              Starts at {getFormattedContestTime(contest)}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-2 sm:mt-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setContestReminder(contest.id, contest.name)}
                            >
                              Set Reminder
                            </Button>
                            <Button size="sm" asChild>
                              <Link to={`/competitions`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming contests</h3>
                    <p className="text-muted-foreground">
                      There are no contests starting soon. Check back later!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Message Notifications</CardTitle>
                {allNotifications.messages.some(m => !m.read) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markAllAsRead('messages')}
                  >
                    Mark all as read
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {allNotifications.messages.length > 0 ? (
                  allNotifications.messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`flex items-start gap-4 p-4 rounded-lg border ${!message.read ? 'bg-accent/50' : ''}`}
                    >
                      <div className="rounded-full p-2 bg-blue-500/10">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <p>{message.text}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatNotificationDate(message.date)}
                            </p>
                          </div>
                          <Button size="sm" asChild className="mt-2 sm:mt-0">
                            <Link to="/messages">View</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No new messages</h3>
                    <p className="text-muted-foreground">
                      Your message inbox is empty.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Connection Notifications</CardTitle>
                {allNotifications.connections.some(c => !c.read) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markAllAsRead('connections')}
                  >
                    Mark all as read
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {allNotifications.connections.length > 0 ? (
                  allNotifications.connections.map(connection => (
                    <div 
                      key={connection.id} 
                      className={`flex items-start gap-4 p-4 rounded-lg border ${!connection.read ? 'bg-accent/50' : ''}`}
                    >
                      <div className="rounded-full p-2 bg-green-500/10">
                        <User className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <p>{connection.text}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatNotificationDate(connection.date)}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" asChild className="mt-2 sm:mt-0">
                            <Link to="/profile">View</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No connection requests</h3>
                    <p className="text-muted-foreground">
                      You have no pending connection requests.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Achievement Notifications</CardTitle>
                {allNotifications.achievements.some(a => !a.read) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markAllAsRead('achievements')}
                  >
                    Mark all as read
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {allNotifications.achievements.length > 0 ? (
                  allNotifications.achievements.map(achievement => (
                    <div 
                      key={achievement.id} 
                      className={`flex items-start gap-4 p-4 rounded-lg border ${!achievement.read ? 'bg-accent/50' : ''}`}
                    >
                      <div className="rounded-full p-2 bg-yellow-500/10">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <p>{achievement.text}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatNotificationDate(achievement.date)}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" asChild className="mt-2 sm:mt-0">
                            <Link to="/achievements">View</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No new achievements</h3>
                    <p className="text-muted-foreground">
                      Keep participating to earn new badges and achievements!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Notifications;
