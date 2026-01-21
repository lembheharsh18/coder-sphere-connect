
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

const mentors = [
  {
    id: '1',
    name: 'Alice Johnson',
    image: '',
    initials: 'AJ',
    title: 'Senior Frontend Developer',
    company: 'Google',
    bio: 'I help developers master React and modern JavaScript concepts.',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Testing'],
    mentees: 8,
    rating: 4.9,
    availability: 'Weekends',
  },
  {
    id: '2',
    name: 'Michael Chen',
    image: '',
    initials: 'MC',
    title: 'Principal Backend Engineer',
    company: 'Amazon',
    bio: 'Specialized in scalable architectures and microservices.',
    skills: ['Java', 'Spring Boot', 'AWS', 'Microservices', 'System Design'],
    mentees: 12,
    rating: 4.8,
    availability: 'Tuesday/Thursday evenings',
  },
  {
    id: '3',
    name: 'Sarah Parker',
    image: '',
    initials: 'SP',
    title: 'Data Science Lead',
    company: 'Netflix',
    bio: 'Helping new data scientists develop their skills and career.',
    skills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'],
    mentees: 5,
    rating: 5.0,
    availability: 'Weekdays, flexible',
  },
];

const menteesRequests = [
  {
    id: '1',
    name: 'James Wilson',
    image: '',
    initials: 'JW',
    lookingFor: 'Guidance with frontend development and React best practices',
    skills: ['HTML', 'CSS', 'JavaScript basics'],
    experience: 'Junior Developer',
    commitment: '5 hours/week',
  },
  {
    id: '2',
    name: 'Emma Rodriguez',
    image: '',
    initials: 'ER',
    lookingFor: 'Help transitioning from backend to fullstack development',
    skills: ['Java', 'Spring', 'SQL'],
    experience: 'Mid-level Backend Developer',
    commitment: '3-4 hours/week',
  },
];

const Mentorship = () => {
  return (
    <MainLayout>
      <div className="container max-w-5xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Mentorship Program</h1>
            <p className="text-muted-foreground">
              Connect with experienced developers or offer guidance to others
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <Card className="md:w-2/3">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>
                  Our mentorship program connects junior developers with experienced professionals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
                      1
                    </div>
                    <h3 className="font-medium mb-2">Connect</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse profiles and find your perfect mentor or mentee match
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
                      2
                    </div>
                    <h3 className="font-medium mb-2">Schedule</h3>
                    <p className="text-sm text-muted-foreground">
                      Set up regular sessions that work with both your schedules
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
                      3
                    </div>
                    <h3 className="font-medium mb-2">Grow</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn, share knowledge, and develop your skills together
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex gap-4 justify-center">
                  <Button>Become a Mentor</Button>
                  <Button variant="outline">Find a Mentor</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:w-1/3">
              <CardHeader>
                <CardTitle>Your Mentorship</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="mb-6 text-muted-foreground">
                  Sign in to view your active mentorships and requests
                </p>
                <Button asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="mentors">
            <TabsList>
              <TabsTrigger value="mentors">Available Mentors</TabsTrigger>
              <TabsTrigger value="mentees">Looking for Mentors</TabsTrigger>
              <TabsTrigger value="resources">Mentorship Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="mentors" className="space-y-4 mt-4">
              {mentors.map((mentor) => (
                <Card key={mentor.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex flex-col items-center md:w-1/4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={mentor.image} alt={mentor.name} />
                          <AvatarFallback className="text-xl">{mentor.initials}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold mt-2 text-center">{mentor.name}</h3>
                        <div className="text-sm text-muted-foreground text-center mt-1">
                          {mentor.title} at {mentor.company}
                        </div>
                        <div className="mt-2 flex items-center">
                          <span className="font-medium text-amber-500">{mentor.rating}</span>
                          <span className="text-amber-500 ml-1">★</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({mentor.mentees} mentees)
                          </span>
                        </div>
                      </div>

                      <div className="md:w-3/4 space-y-3">
                        <p>{mentor.bio}</p>
                        <div>
                          <h4 className="font-medium mb-1">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {mentor.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Availability</h4>
                          <p className="text-sm text-muted-foreground">{mentor.availability}</p>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <Button>Request Mentorship</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full">
                View More Mentors
              </Button>
            </TabsContent>

            <TabsContent value="mentees" className="space-y-4 mt-4">
              {menteesRequests.map((mentee) => (
                <Card key={mentee.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex flex-col items-center md:w-1/4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={mentee.image} alt={mentee.name} />
                          <AvatarFallback className="text-xl">{mentee.initials}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold mt-2 text-center">{mentee.name}</h3>
                        <div className="text-sm text-muted-foreground text-center mt-1">
                          {mentee.experience}
                        </div>
                      </div>

                      <div className="md:w-3/4 space-y-3">
                        <div>
                          <h4 className="font-medium mb-1">Looking For</h4>
                          <p>{mentee.lookingFor}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Current Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {mentee.skills.map((skill) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Time Commitment</h4>
                          <p className="text-sm text-muted-foreground">{mentee.commitment}</p>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <Button>Offer Mentorship</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="resources">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Effective Mentorship Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Learn best practices for both mentors and mentees to create a successful
                      mentoring relationship.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Read Guide
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Setting Good Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      How to set clear, achievable goals for your mentorship journey and track
                      progress.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Article
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Mentorship;
