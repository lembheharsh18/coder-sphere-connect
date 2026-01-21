import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import CodeSnippetsSection from '@/components/learning/CodeSnippetsSection';
import CodingChallengesSection from '@/components/learning/CodingChallengesSection';
import TutorialsSection from '@/components/learning/TutorialsSection';
import { useLocation } from 'react-router-dom';
import { getLearningChallenges, getTutorialVideos } from '@/api/feed';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { createFeedPost } from '@/api/feed';

interface LearningChallenge {
  id: string;
  title: string;
  difficulty: string;
  url: string;
}

interface TutorialVideo {
  id: string;
  title: string;
  duration: string;
  url: string;
}

const Learning = () => {
  const [challenges, setChallenges] = useState<LearningChallenge[]>([]);
  const [tutorials, setTutorials] = useState<TutorialVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newChallengeOpen, setNewChallengeOpen] = useState(false);
  const [newTutorialOpen, setNewTutorialOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('challenges');
  const location = useLocation();
  const { user } = useAuth();
  
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [challengeDifficulty, setChallengeDifficulty] = useState('Medium');
  const [challengeLink, setChallengeLink] = useState('');
  
  const [tutorialTitle, setTutorialTitle] = useState('');
  const [tutorialDescription, setTutorialDescription] = useState('');
  const [tutorialLink, setTutorialLink] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (params.has('challenge')) {
      setActiveTab('challenges');
    } else if (params.has('video')) {
      setActiveTab('tutorials');
    } else if (params.has('snippet')) {
      setActiveTab('snippets');
    }
  }, [location]);
  
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const [challengesData, tutorialsData] = await Promise.all([
          getLearningChallenges(),
          getTutorialVideos()
        ]);
        
        setChallenges(challengesData);
        setTutorials(tutorialsData);
      } catch (error) {
        console.error("Error loading learning content:", error);
        toast.error("Failed to load learning content");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, []);
  
  const handleChallengeSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to add a challenge");
      return;
    }
    
    if (!challengeTitle.trim() || !challengeDescription.trim() || !challengeLink.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      await createFeedPost(
        `🧩 Coding Challenge: ${challengeTitle}\n\nDifficulty: ${challengeDifficulty}\n\n${challengeDescription}\n\nTry it here: ${challengeLink}`,
        user.id
      );
      
      toast.success("Challenge added successfully!");
      
      setChallengeTitle('');
      setChallengeDescription('');
      setChallengeDifficulty('Medium');
      setChallengeLink('');
      setNewChallengeOpen(false);
      
      const newChallenges = await getLearningChallenges();
      setChallenges(newChallenges);
    } catch (error) {
      console.error("Error adding challenge:", error);
      toast.error("Failed to add challenge");
    }
  };
  
  const handleTutorialSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to add a tutorial");
      return;
    }
    
    if (!tutorialTitle.trim() || !tutorialDescription.trim() || !tutorialLink.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      await createFeedPost(
        `📚 Tutorial: ${tutorialTitle}\n\n${tutorialDescription}\n\nWatch here: ${tutorialLink}`,
        user.id
      );
      
      toast.success("Tutorial added successfully!");
      
      setTutorialTitle('');
      setTutorialDescription('');
      setTutorialLink('');
      setNewTutorialOpen(false);
      
      const newTutorials = await getTutorialVideos();
      setTutorials(newTutorials);
    } catch (error) {
      console.error("Error adding tutorial:", error);
      toast.error("Failed to add tutorial");
    }
  };
  
  return (
    <MainLayout>
      <div className="container max-w-5xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Learning Hub</h1>
            <p className="text-muted-foreground">
              Enhance your coding skills with community resources, tutorials, and challenges
            </p>
          </div>
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="challenges">Coding Challenges</TabsTrigger>
                <TabsTrigger value="snippets">Code Snippets</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              </TabsList>
              
              {activeTab === 'challenges' && (
                <Dialog open={newChallengeOpen} onOpenChange={setNewChallengeOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Challenge
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Coding Challenge</DialogTitle>
                      <DialogDescription>
                        Share a coding challenge with the community
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Challenge Title</Label>
                        <Input 
                          id="title" 
                          placeholder="Array Manipulation Challenge" 
                          value={challengeTitle}
                          onChange={(e) => setChallengeTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Describe the challenge..." 
                          value={challengeDescription}
                          onChange={(e) => setChallengeDescription(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select 
                          value={challengeDifficulty} 
                          onValueChange={setChallengeDifficulty}
                        >
                          <SelectTrigger id="difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link">Challenge Link</Label>
                        <Input 
                          id="link" 
                          placeholder="https://leetcode.com/problems/..." 
                          value={challengeLink}
                          onChange={(e) => setChallengeLink(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleChallengeSubmit}>Submit Challenge</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {activeTab === 'tutorials' && (
                <Dialog open={newTutorialOpen} onOpenChange={setNewTutorialOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Tutorial
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share a Tutorial</DialogTitle>
                      <DialogDescription>
                        Share a helpful tutorial with the community
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Tutorial Title</Label>
                        <Input 
                          id="title" 
                          placeholder="React Hooks Deep Dive" 
                          value={tutorialTitle}
                          onChange={(e) => setTutorialTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="What will users learn from this tutorial?" 
                          value={tutorialDescription}
                          onChange={(e) => setTutorialDescription(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link">Tutorial Link</Label>
                        <Input 
                          id="link" 
                          placeholder="https://www.youtube.com/watch?v=..." 
                          value={tutorialLink}
                          onChange={(e) => setTutorialLink(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleTutorialSubmit}>Submit Tutorial</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <TabsContent value="challenges" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {challenges.map((challenge) => (
                      <Card key={challenge.id}>
                        <CardHeader>
                          <CardTitle>{challenge.title}</CardTitle>
                          <CardDescription>
                            Difficulty: <span className={
                              challenge.difficulty === 'Easy' ? 'text-green-500' :
                              challenge.difficulty === 'Medium' ? 'text-amber-500' :
                              'text-red-500'
                            }>{challenge.difficulty}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button asChild variant="outline" className="w-full">
                            <a href={challenge.url} target="_blank" rel="noopener noreferrer">
                              View Challenge
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  <CodingChallengesSection />
                </>
              )}
            </TabsContent>
            
            <TabsContent value="snippets">
              <CodeSnippetsSection />
            </TabsContent>
            
            <TabsContent value="tutorials" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {tutorials.map((tutorial) => (
                      <Card key={tutorial.id}>
                        <CardHeader>
                          <CardTitle>{tutorial.title}</CardTitle>
                          <CardDescription>
                            Duration: {tutorial.duration}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button asChild variant="outline" className="w-full">
                            <a href={tutorial.url} target="_blank" rel="noopener noreferrer">
                              Watch Tutorial
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  <TutorialsSection />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Learning;
