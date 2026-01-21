
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Book, Clock } from 'lucide-react';

const tutorials = [
  {
    id: '1',
    title: 'Building a Full-Stack Application with React and Node.js',
    description: 'Learn how to create a complete web application with React frontend and Node.js backend, including authentication, database integration, and deployment.',
    image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    author: {
      name: 'Michael Chen',
      image: '',
      initials: 'MC'
    },
    duration: '3 hours',
    level: 'Intermediate',
    tags: ['React', 'Node.js', 'Full-Stack']
  },
  {
    id: '2',
    title: 'Mastering CSS Grid Layouts',
    description: 'A comprehensive guide to creating complex layouts with CSS Grid. Learn about grid templates, areas, alignment, and responsive design techniques.',
    image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    author: {
      name: 'Emily Wong',
      image: '',
      initials: 'EW'
    },
    duration: '1.5 hours',
    level: 'Beginner',
    tags: ['CSS', 'Layout', 'Responsive Design']
  },
  {
    id: '3',
    title: 'TypeScript for JavaScript Developers',
    description: 'Learn how to leverage TypeScript to write more robust and maintainable JavaScript code. Covers types, interfaces, generics, and advanced patterns.',
    image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    author: {
      name: 'David Miller',
      image: '',
      initials: 'DM'
    },
    duration: '2 hours',
    level: 'Intermediate',
    tags: ['TypeScript', 'JavaScript', 'Web Development']
  }
];

const TutorialsSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Tutorials</h2>
        <Button variant="outline">Browse All</Button>
      </div>
      
      <div className="space-y-6">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 h-48 md:h-auto relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${tutorial.image})` }}
                />
              </div>
              <div className="md:w-2/3">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{tutorial.level}</Badge>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{tutorial.duration}</span>
                    </div>
                  </div>
                  <CardTitle>{tutorial.title}</CardTitle>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tutorial.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={tutorial.author.image} alt={tutorial.author.name} />
                      <AvatarFallback>{tutorial.author.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{tutorial.author.name}</span>
                  </div>
                  <Button>Start Learning</Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TutorialsSection;
