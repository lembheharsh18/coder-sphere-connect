
import React, { useRef, useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Feed from '@/components/feed/Feed';
import { Card, CardContent } from '@/components/ui/card';
import AIChatbot from '@/components/chatbot/AIChatbot';
import '@/styles/login.css';
import { getTrendingTopics } from '@/api/feed';
import { Loader2 } from 'lucide-react';
import ConnectSearch from '@/components/profile/ConnectSearch';

const Index = () => {
  // Create a ref to the feed component for refreshing
  const feedRef = useRef<{ refreshFeed: () => void }>(null);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  
  // Initialize localStorage with posts if it's empty (first visit)
  useEffect(() => {
    const hasPosts = localStorage.getItem('feedPosts');
    if (!hasPosts) {
      localStorage.setItem('feedPosts', '[]');
    }
    
    // Load trending topics
    const loadTrendingTopics = async () => {
      setIsLoadingTopics(true);
      try {
        const topics = await getTrendingTopics();
        setTrendingTopics(topics.length > 0 ? topics : ["JavaScript", "React", "TypeScript", "WebDev", "Programming"]);
      } catch (error) {
        console.error("Failed to load trending topics:", error);
        setTrendingTopics(["JavaScript", "React", "TypeScript", "WebDev", "Programming"]);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    
    loadTrendingTopics();
  }, []);
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
        {/* Left Sidebar - AI Chatbot */}
        <div className="w-full md:w-1/4 relative z-10">
          <div className="sticky top-20">
            <AIChatbot />
          </div>
        </div>
        
        {/* Main Feed */}
        <div className="w-full md:w-2/4">
          <Feed showCreatePost={true} />
        </div>
        
        {/* Right Sidebar - Connection Search and Trending Topics */}
        <div className="w-full md:w-1/4">
          <div className="sticky top-20 space-y-4">
            <ConnectSearch />
            
            <Card className="bg-card shadow-sm z-0">
              <CardContent className="p-4">
                <h2 className="font-semibold text-lg text-foreground mb-4">Trending Topics</h2>
                {isLoadingTopics ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {trendingTopics.map((topic, i) => (
                      <li
                        key={i}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        #{topic}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
