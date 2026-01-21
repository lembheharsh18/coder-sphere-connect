
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Code, Plus, Search, Users, Loader2 } from 'lucide-react';
import { getUserProjects, getCollaboratorProjects } from '@/api/projects';
import { Project } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import AddProjectDialog from '@/components/profile/AddProjectDialog';

const Projects = () => {
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [collaboratingProjects, setCollaboratingProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // In a real app, you'd use the logged-in user's ID
        const mockUserId = `user-${Math.floor(Math.random() * 10) + 1}`;
        
        // Fetch projects owned by the user
        const owned = await getUserProjects(mockUserId);
        setOwnedProjects(owned);
        
        // Fetch projects where the user is a collaborator
        const collaborating = await getCollaboratorProjects(mockUserId);
        setCollaboratingProjects(collaborating);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [toast]);

  // Filter projects based on search term
  const filteredProjects = [...ownedProjects, ...collaboratingProjects].filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProject = () => {
    setIsDialogOpen(true);
  };

  const handleProjectAdded = () => {
    // Refresh the projects list
    const fetchProjects = async () => {
      try {
        const mockUserId = `user-${Math.floor(Math.random() * 10) + 1}`;
        const owned = await getUserProjects(mockUserId);
        setOwnedProjects(owned);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    
    fetchProjects();
  };

  return (
    <MainLayout>
      <div className="container max-w-5xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground">
                Find projects to collaborate on or create your own
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleAddProject}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="text-center py-12 bg-card rounded-lg shadow-sm border border-border">
                  <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ? "Try a different search term" : "Create a new project to get started"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={handleAddProject}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddProjectDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSuccess={handleProjectAdded}
      />
    </MainLayout>
  );
};

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Mock skills based on project title and description for demonstration
  const generateMockSkills = (project: Project) => {
    const allSkills = ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Firebase', 'MongoDB', 'Express', 'Next.js', 'Python', 'Django', 'Flask', 'Vue', 'Angular', 'Svelte', 'Docker', 'AWS', 'Azure', 'GCP', 'Flutter', 'React Native'];
    const numSkills = Math.floor(Math.random() * 3) + 1;
    const skills = [];
    
    for (let i = 0; i < numSkills; i++) {
      const skill = allSkills[Math.floor(Math.random() * allSkills.length)];
      if (!skills.includes(skill)) {
        skills.push(skill);
      }
    }
    
    return skills;
  };
  
  const skills = generateMockSkills(project);

  return (
    <Card key={project.id}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <Link
            to={`/projects/${project.id}`}
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            {project.title}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-muted-foreground mb-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between text-sm items-center">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {project.collaborators && project.collaborators.length > 0 
              ? `${project.collaborators.length + 1} members` 
              : '1 member'}
          </span>
        </div>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/projects/${project.id}`}>View Project</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Projects;
