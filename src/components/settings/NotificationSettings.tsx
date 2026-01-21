
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { updateNotificationPreferences } from '@/api/settings';
import { 
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const NotificationSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    messages: true,
    connections: true,
    forums: true,
    contests: true,
    email: false,
    contestReminders: "1hour" // Options: "1day", "1hour", "30min", "10min"
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await updateNotificationPreferences(user.id, {
        emailNotifications: settings.email,
        messageNotifications: settings.messages,
        connectionNotifications: settings.connections,
        forumNotifications: settings.forums,
        contestNotifications: settings.contests,
      });
      
      // Also store in localStorage for persistence
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="messages" className="text-base">Direct Messages</Label>
                <p className="text-sm text-muted-foreground">Receive notifications for direct messages</p>
              </div>
              <Switch 
                id="messages" 
                checked={settings.messages}
                onCheckedChange={() => handleSwitchChange('messages')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="connections" className="text-base">Connection Requests</Label>
                <p className="text-sm text-muted-foreground">Receive notifications for new connection requests</p>
              </div>
              <Switch 
                id="connections" 
                checked={settings.connections}
                onCheckedChange={() => handleSwitchChange('connections')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="forums" className="text-base">Forum Activity</Label>
                <p className="text-sm text-muted-foreground">Receive notifications for replies to your forum posts</p>
              </div>
              <Switch 
                id="forums" 
                checked={settings.forums}
                onCheckedChange={() => handleSwitchChange('forums')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="contests" className="text-base">Competitions</Label>
                <p className="text-sm text-muted-foreground">Receive notifications about upcoming coding competitions</p>
              </div>
              <Switch 
                id="contests" 
                checked={settings.contests}
                onCheckedChange={() => handleSwitchChange('contests')}
              />
            </div>
            
            {settings.contests && (
              <div className="flex items-center justify-between pl-6 border-l-2 ml-2">
                <div>
                  <Label htmlFor="contestReminders" className="text-base">Contest Reminders</Label>
                  <p className="text-sm text-muted-foreground">When should we remind you about contests?</p>
                </div>
                <Select 
                  value={settings.contestReminders}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, contestReminders: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1day">1 day before</SelectItem>
                    <SelectItem value="1hour">1 hour before</SelectItem>
                    <SelectItem value="30min">30 minutes before</SelectItem>
                    <SelectItem value="10min">10 minutes before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notif" className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email notifications in addition to in-app notifications</p>
              </div>
              <Switch 
                id="email-notif" 
                checked={settings.email}
                onCheckedChange={() => handleSwitchChange('email')}
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
