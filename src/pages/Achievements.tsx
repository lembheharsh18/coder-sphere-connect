
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Clock, ExternalLink, Loader2, Medal, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AddAchievementDialog, { Achievement } from '@/components/achievements/AddAchievementDialog';
import { addUserAchievement, getUserAchievements, UserAchievement } from '@/api/userAchievements';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  });
};

const getCategoryIcon = (category: string) => {
  switch(category.toLowerCase()) {
    case 'certification':
      return <Award className="h-5 w-5 mr-2" />;
    case 'award':
      return <Medal className="h-5 w-5 mr-2" />;
    default:
      return <Clock className="h-5 w-5 mr-2" />;
  }
};

const AchievementCard: React.FC<{ achievement: UserAchievement }> = ({ achievement }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center text-primary mb-2">
          {getCategoryIcon(achievement.category)}
          <span className="text-sm font-medium capitalize">{achievement.category}</span>
        </div>
        <CardTitle>{achievement.title}</CardTitle>
        <CardDescription>{formatDate(achievement.date)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{achievement.description}</p>
        
        {achievement.imageUrl && (
          <div className="mt-4">
            <img 
              src={achievement.imageUrl} 
              alt={achievement.title} 
              className="rounded-md w-full h-auto object-cover max-h-[150px]"
            />
          </div>
        )}
      </CardContent>
      {achievement.url && (
        <CardFooter className="pt-2">
          <Button variant="outline" asChild className="w-full">
            <a 
              href={achievement.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center"
            >
              Verify
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const Achievements = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const { user } = useAuth();
  
  const loadAchievements = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const achievements = await getUserAchievements(user.id);
      setUserAchievements(achievements);
    } catch (error) {
      console.error("Failed to load achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadAchievements();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const handleAddAchievement = async (achievement: Achievement) => {
    if (!user) {
      toast.error("You must be logged in to add achievements");
      return;
    }
    
    try {
      await addUserAchievement(user.id, {
        title: achievement.title,
        description: achievement.description,
        date: achievement.date,
        category: achievement.category,
        imageUrl: achievement.imageUrl,
        url: achievement.url
      });
      
      // Refresh achievements
      loadAchievements();
    } catch (error) {
      console.error("Error adding achievement:", error);
      toast.error("Failed to add achievement");
    }
  };
  
  // Filter achievements based on active tab
  const filteredAchievements = userAchievements.filter(achievement => {
    if (activeTab === 'all') return true;
    return achievement.category === activeTab;
  });
  
  return (
    <MainLayout>
      <div className="container max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Achievements</h1>
            <p className="text-muted-foreground mt-1">Track and showcase your professional accomplishments</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <AddAchievementDialog onAchievementAdded={handleAddAchievement} />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="certification">Certifications</TabsTrigger>
            <TabsTrigger value="award">Awards</TabsTrigger>
            <TabsTrigger value="project">Projects</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <TabsContent value={activeTab}>
              {!user ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Please sign in to view your achievements</p>
                  <Button asChild>
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              ) : filteredAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAchievements.map(achievement => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium mt-4">No achievements yet</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Add your certifications, awards and other accomplishments to showcase them here
                  </p>
                  <AddAchievementDialog onAchievementAdded={handleAddAchievement} />
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Achievements;
