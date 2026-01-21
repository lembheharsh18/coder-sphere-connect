
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
  user: {
    name: string;
    image?: string;
    bio?: string;
    location?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    website?: string;
    reputation: number;
    rank?: string;
  };
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {user.rank && (
              <Badge variant="secondary" className="w-fit">
                {user.rank}
              </Badge>
            )}
          </div>
          {user.bio && <p className="text-muted-foreground">{user.bio}</p>}
          <div className="flex flex-wrap gap-2 items-center">
            {user.location && (
              <span className="text-sm text-muted-foreground">
                📍 {user.location}
              </span>
            )}
            <span className="text-sm font-medium">
              Reputation: {user.reputation}
            </span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline">Message</Button>
          <Button>Connect</Button>
        </div>
      </div>

      {/* Social links */}
      <div className="flex gap-3">
        {user.githubUrl && (
          <a
            href={user.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        )}
        {user.linkedinUrl && (
          <a
            href={user.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
        )}
        {user.website && (
          <a
            href={user.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
