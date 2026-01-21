
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import SkillsSection from '@/components/profile/SkillsSection';
import ProjectsSection from '@/components/profile/ProjectsSection';
import BadgesSection from '@/components/profile/BadgesSection';
import ConnectionSection from '@/components/profile/ConnectionSection';
import { useAuth } from '@/contexts/AuthContext';
import CodeSnippetsSection from '@/components/learning/CodeSnippetsSection';

const Profile = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const [isCurrentUser, setIsCurrentUser] = useState(true);
  const [profileUserId, setProfileUserId] = useState<string>('');
  
  useEffect(() => {
    // If userId is provided in URL, check if it matches the current user
    if (userId && user) {
      setIsCurrentUser(userId === user.id);
      setProfileUserId(userId);
    } else if (user) {
      // If no userId in URL, we're viewing the current user's profile
      setIsCurrentUser(true);
      setProfileUserId(user.id);
    }
  }, [userId, user]);
  
  // If user isn't loaded yet, show loading state
  if (!user) {
    return (
      <MainLayout>
        <div className="container flex justify-center items-center py-20">
          <p>Loading profile...</p>
        </div>
      </MainLayout>
    );
  }
  
  // Use actual user data for profile
  const profileData = {
    id: profileUserId,
    name: user.name,
    image: user.image || '',
    bio: user.bio || 'No bio provided',
    location: user.location || 'Location not specified',
    githubUrl: user.githubUrl || '',
    linkedinUrl: user.linkedinUrl || '',
    website: '', // Not in the current user model
    reputation: 0, // Default value
    rank: 'Member', // Default rank
  };

  // In a real app, we'd use the profileUserId to fetch the data for other users,
  // but for now we'll use the current user's data

  return (
    <MainLayout>
      <div className="container max-w-5xl">
        <div className="space-y-8">
          <ProfileHeader user={profileData} />
          
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="code-snippets">Code Snippets</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <SkillsSection skills={[]} />
              <ProjectsSection userId={profileUserId} isCurrentUser={isCurrentUser} />
              <BadgesSection userId={profileUserId} isCurrentUser={isCurrentUser} />
            </TabsContent>
            
            <TabsContent value="projects">
              <ProjectsSection userId={profileUserId} isCurrentUser={isCurrentUser} />
            </TabsContent>
            
            <TabsContent value="connections">
              <ConnectionSection userId={profileUserId} isCurrentUser={isCurrentUser} />
            </TabsContent>
            
            <TabsContent value="code-snippets">
              <CodeSnippetsSection />
            </TabsContent>
            
            <TabsContent value="achievements">
              <BadgesSection userId={profileUserId} isCurrentUser={isCurrentUser} />
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="text-center py-20 text-muted-foreground">
                Activity timeline coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
