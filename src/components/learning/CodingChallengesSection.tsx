
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Code, Users } from 'lucide-react';

const challenges = [
  {
    id: '1',
    title: 'Implement a Binary Search Tree',
    description: 'Create a binary search tree with insert, delete, and search operations.',
    difficulty: 'Intermediate',
    participants: 128,
    timeEstimate: '2-3 hours',
    tags: ['Data Structures', 'Algorithms', 'Trees']
  },
  {
    id: '2',
    title: 'Build a React State Management Hook',
    description: 'Create a custom React hook that manages global state without external libraries.',
    difficulty: 'Advanced',
    participants: 87,
    timeEstimate: '1-2 hours',
    tags: ['React', 'Hooks', 'State Management']
  },
  {
    id: '3',
    title: 'Create a Responsive Grid Layout',
    description: 'Implement a responsive grid layout using CSS Grid and Flexbox.',
    difficulty: 'Beginner',
    participants: 245,
    timeEstimate: '1 hour',
    tags: ['CSS', 'Responsive Design', 'Layout']
  },
  {
    id: '4',
    title: 'Implement Debounce and Throttle',
    description: 'Build your own debounce and throttle functions from scratch.',
    difficulty: 'Intermediate',
    participants: 156,
    timeEstimate: '1-2 hours',
    tags: ['JavaScript', 'Performance', 'Functions']
  }
];

const difficultyColors = {
  'Beginner': 'bg-green-100 text-green-800',
  'Intermediate': 'bg-yellow-100 text-yellow-800',
  'Advanced': 'bg-red-100 text-red-800'
};

const CodingChallengesSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Popular Challenges</h2>
        <Button variant="outline">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{challenge.title}</CardTitle>
                <Badge variant="outline" className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}>
                  {challenge.difficulty}
                </Badge>
              </div>
              <CardDescription className="mt-2">{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {challenge.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{challenge.participants} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{challenge.timeEstimate}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Start Challenge</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CodingChallengesSection;
