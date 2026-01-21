
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ExternalLink, Clock, Filter, RefreshCw, Trophy, MessageSquare, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  fetchAllContests, 
  Contest, 
  platformConfig, 
  getContestCountdown, 
  formatContestDate 
} from '@/api/contestApis';
import { toast } from '@/hooks/use-toast';

// Platform filter options
type PlatformFilter = 'all' | 'Codeforces' | 'CodeChef' | 'LeetCode';

const Competitions = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  // Fetch contests on mount
  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const data = await fetchAllContests();
      setContests(data);
    } catch (error) {
      console.error('Failed to fetch contests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshContests = async () => {
    setRefreshing(true);
    await loadContests();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Contest data has been updated.',
    });
  };

  // Filter contests by platform and status
  const filterContests = (status: 'upcoming' | 'past') => {
    return contests.filter(contest => {
      const matchesPlatform = platformFilter === 'all' || contest.platform === platformFilter;
      const matchesStatus = contest.status === status || (status === 'upcoming' && contest.status === 'ongoing');
      return matchesPlatform && matchesStatus;
    });
  };

  const upcomingContests = filterContests('upcoming');
  const pastContests = filterContests('past');

  // Get platform badge variant
  const getPlatformBadgeStyle = (platform: Contest['platform']) => {
    const config = platformConfig[platform];
    return `${config.bgColor} ${config.textColor} border-0`;
  };

  // Contest card component
  const ContestCard = ({ contest, showCountdown = false }: { contest: Contest; showCountdown?: boolean }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-colors">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getPlatformBadgeStyle(contest.platform)}>
            {contest.platform}
          </Badge>
          {contest.status === 'ongoing' && (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <span className="animate-pulse mr-1">●</span> Live
            </Badge>
          )}
          <h3 className="font-semibold">{contest.name}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatContestDate(contest.startTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{contest.duration}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 sm:mt-0">
        {showCountdown && contest.status === 'upcoming' && (
          <div className="text-right mr-2">
            <div className="text-xs text-muted-foreground">Starts in</div>
            <div className="font-semibold text-primary">{getContestCountdown(contest.startTime)}</div>
          </div>
        )}
        <Button size="sm" asChild>
          <a href={contest.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-1" />
            {contest.status === 'past' ? 'View Problems' : 'Join Contest'}
          </a>
        </Button>
        {contest.status === 'upcoming' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              toast({
                title: 'Reminder Set',
                description: `You'll be notified before ${contest.name} starts.`,
              });
            }}
          >
            Remind Me
          </Button>
        )}
      </div>
    </div>
  );

  // Loading skeleton
  const ContestSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      ))}
    </div>
  );

  return (
    <MainLayout>
      <div className="container max-w-5xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="w-8 h-8 text-primary" />
                Competitive Programming
              </h1>
              <p className="text-muted-foreground">
                Track contests from Codeforces, LeetCode, and CodeChef
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={refreshContests} 
              disabled={refreshing}
              className="shrink-0"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Platform Filter */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mr-2">Filter by platform:</span>
                {(['all', 'Codeforces', 'LeetCode', 'CodeChef'] as PlatformFilter[]).map((platform) => (
                  <Button
                    key={platform}
                    size="sm"
                    variant={platformFilter === platform ? 'default' : 'outline'}
                    onClick={() => setPlatformFilter(platform)}
                  >
                    {platform === 'all' ? 'All Platforms' : platform}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="contests">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contests" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Contests
              </TabsTrigger>
              <TabsTrigger value="discussions" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="practice" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Practice
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="contests" className="space-y-6">
              {/* Upcoming Contests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Upcoming Contests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <ContestSkeleton />
                  ) : upcomingContests.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingContests.map(contest => (
                        <ContestCard key={contest.id} contest={contest} showCountdown />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming contests found for the selected platform.
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Past Contests */}
              <Card>
                <CardHeader>
                  <CardTitle>Past Contests (Last Week)</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <ContestSkeleton />
                  ) : pastContests.length > 0 ? (
                    <div className="space-y-4">
                      {pastContests.map(contest => (
                        <ContestCard key={contest.id} contest={contest} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No past contests found for the selected platform.
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View More Past Contests
                  </Button>
                </CardFooter>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a 
                      href="https://codeforces.com/contests" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platformConfig.Codeforces.bgColor}`}>
                        <span className="font-bold text-blue-600">CF</span>
                      </div>
                      <div>
                        <div className="font-semibold">Codeforces</div>
                        <div className="text-sm text-muted-foreground">View all contests</div>
                      </div>
                    </a>
                    <a 
                      href="https://leetcode.com/contest/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platformConfig.LeetCode.bgColor}`}>
                        <span className="font-bold text-orange-600">LC</span>
                      </div>
                      <div>
                        <div className="font-semibold">LeetCode</div>
                        <div className="text-sm text-muted-foreground">Weekly contests</div>
                      </div>
                    </a>
                    <a 
                      href="https://www.codechef.com/contests" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platformConfig.CodeChef.bgColor}`}>
                        <span className="font-bold text-amber-700">CC</span>
                      </div>
                      <div>
                        <div className="font-semibold">CodeChef</div>
                        <div className="text-sm text-muted-foreground">Practice & contests</div>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="discussions">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Contest Discussions</CardTitle>
                    <Button size="sm" asChild>
                      <Link to="/contests/new-discussion">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        New Discussion
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sample discussions */}
                    {[
                      { id: '1', title: 'Codeforces Round 940 - Problem D Approach', platform: 'Codeforces', author: 'AlgorithmExpert', replies: 24, views: 512 },
                      { id: '2', title: 'LeetCode Weekly 389 - Optimal DP Solution', platform: 'LeetCode', author: 'DPMaster', replies: 18, views: 387 },
                      { id: '3', title: 'CodeChef Starters 125 - Graph Problem Editorial', platform: 'CodeChef', author: 'GraphNinja', replies: 12, views: 256 },
                    ].map(discussion => (
                      <div key={discussion.id} className="p-4 border rounded-lg hover:bg-accent/30 transition-colors">
                        <div className="flex justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{discussion.platform}</Badge>
                              <Link 
                                to={`/contests/${discussion.id}/discussions`}
                                className="font-semibold hover:text-primary transition-colors"
                              >
                                {discussion.title}
                              </Link>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Posted by {discussion.author}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground text-right">
                            <div>{discussion.replies} replies</div>
                            <div>{discussion.views} views</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/contests/discussions">
                      View All Discussions
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="practice">
              <Card>
                <CardHeader>
                  <CardTitle>Practice Problems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Problem categories */}
                    {[
                      { name: 'Arrays & Strings', count: 150, difficulty: 'Easy-Medium' },
                      { name: 'Dynamic Programming', count: 120, difficulty: 'Medium-Hard' },
                      { name: 'Graphs & Trees', count: 100, difficulty: 'Medium-Hard' },
                      { name: 'Binary Search', count: 80, difficulty: 'Easy-Medium' },
                      { name: 'Greedy Algorithms', count: 70, difficulty: 'Medium' },
                      { name: 'Number Theory', count: 60, difficulty: 'Medium-Hard' },
                    ].map(category => (
                      <div key={category.name} className="p-4 border rounded-lg hover:bg-accent/30 transition-colors cursor-pointer">
                        <div className="font-semibold">{category.name}</div>
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>{category.count} problems</span>
                          <span>{category.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full text-center text-muted-foreground">
                    <p>Practice problems from past contests will be available soon!</p>
                    <p className="text-sm mt-2">
                      Meanwhile, try problems on{' '}
                      <a href="https://leetcode.com/problemset/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        LeetCode
                      </a>
                      {', '}
                      <a href="https://codeforces.com/problemset" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Codeforces
                      </a>
                      {', or '}
                      <a href="https://www.codechef.com/practice" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        CodeChef
                      </a>
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Competitions;
