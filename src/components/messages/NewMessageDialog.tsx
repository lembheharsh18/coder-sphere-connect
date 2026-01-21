
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { searchUsers, startConversation } from '@/api/messages';
import { Conversation, UserBasicInfo } from '@/types/messages';
import { Search } from 'lucide-react';

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewConversation: (conversation: Conversation) => void;
}

const NewMessageDialog: React.FC<NewMessageDialogProps> = ({ open, onOpenChange, onNewConversation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserBasicInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserBasicInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const delaySearch = setTimeout(() => {
        searchUsers(searchQuery)
          .then(result => {
            setUsers(result);
          })
          .catch(() => {
            toast({
              title: "Search failed",
              description: "Failed to search for users. Please try again.",
              variant: "destructive",
            });
          })
          .finally(() => setIsSearching(false));
      }, 500);

      return () => clearTimeout(delaySearch);
    } else {
      setUsers([]);
    }
  }, [searchQuery, toast]);

  const handleUserClick = (user: UserBasicInfo) => {
    setSelectedUser(user);
    setSearchQuery('');
  };

  const handleStartConversation = async () => {
    if (!selectedUser) return;
    
    try {
      const newConversation = await startConversation(selectedUser.id);
      onNewConversation(newConversation);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Search for users to start a conversation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {selectedUser ? (
            <div className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={selectedUser.image || undefined} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{selectedUser.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                Change
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="max-h-64 overflow-y-auto border rounded-md">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">Searching...</div>
                ) : users.length === 0 && searchQuery ? (
                  <div className="p-4 text-center text-muted-foreground">No users found</div>
                ) : (
                  <ul className="divide-y">
                    {users.map((user) => (
                      <li
                        key={user.id}
                        className="p-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={user.image || undefined} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.status || 'User'}</div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={handleStartConversation}
              disabled={!selectedUser}
            >
              Start Conversation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;
