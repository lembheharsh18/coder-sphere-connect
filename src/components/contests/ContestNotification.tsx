
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Contest } from '@/types/contest';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isTomorrow, isWithinInterval, addDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface ContestNotificationProps {
  upcomingContests: Contest[];
}

const ContestNotification: React.FC<ContestNotificationProps> = ({ upcomingContests }) => {
  const [open, setOpen] = useState(false);
  const [readContests, setReadContests] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('readContestNotifications') || '{}');
    } catch {
      return {};
    }
  });

  const filteredContests = upcomingContests.filter(contest => {
    const startTime = new Date(contest.startTime);
    const now = new Date();
    return isWithinInterval(startTime, { start: now, end: addDays(now, 3) });
  });

  const unreadCount = filteredContests.filter(contest => !readContests[contest.id]).length;

  const markAsRead = () => {
    const newReadContests = { ...readContests };
    filteredContests.forEach(contest => {
      newReadContests[contest.id] = true;
    });
    setReadContests(newReadContests);
    localStorage.setItem('readContestNotifications', JSON.stringify(newReadContests));
    setOpen(false);
  };

  const formatContestTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const setReminder = (contestId: string, contestName: string) => {
    // In a real app, this would set up a real reminder
    toast({
      title: "Reminder set",
      description: `You'll be reminded about ${contestName} before it starts.`,
    });
    
    const reminders = JSON.parse(localStorage.getItem('contestReminders') || '{}');
    reminders[contestId] = true;
    localStorage.setItem('contestReminders', JSON.stringify(reminders));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-medium">Upcoming Contests</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-auto">
          {filteredContests.length > 0 ? (
            filteredContests.map(contest => (
              <div 
                key={contest.id} 
                className={`p-3 border-b hover:bg-accent/50 last:border-0 ${!readContests[contest.id] ? 'bg-accent/30' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{contest.platform}</Badge>
                      <p className="font-medium text-sm">{contest.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatContestTime(contest.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => setReminder(contest.id, contest.name)}
                  >
                    Remind Me
                  </Button>
                  <Button size="sm" className="text-xs" asChild>
                    <Link to="/competitions">View</Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No upcoming contests</p>
            </div>
          )}
        </div>
        <div className="p-3 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/notifications">View All Notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ContestNotification;
