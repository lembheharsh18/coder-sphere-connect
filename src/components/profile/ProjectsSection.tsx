
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserProjects } from '@/api/projects';
import { useAuth } from '@/contexts/AuthContext';
import AddProjectDialog from './AddProjectDialog';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';

interface ProjectsSectionProps {
  userId: string;
  isCurrentUser: boolean;
}

const ProjectsSection = ({ userId, isCurrentUser }: ProjectsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getUserProjects(userId);
      setProjects(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userId, toast]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        {isCurrentUser && (
          <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
            Add Project
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.collaborators && project.collaborators.length > 0 && (
                      <Badge variant="outline">
                        {project.collaborators.length} Collaborator{project.collaborators.length !== 1 && 's'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {project.repoUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Repository
                        </a>
                      </Button>
                    )}
                    {project.demoUrl && (
                      <Button size="sm" asChild>
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {projects.length === 0 && (
              <div className="col-span-2 py-8 text-center text-muted-foreground">
                {isCurrentUser ? "You haven't added any projects yet" : "No projects added yet"}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AddProjectDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSuccess={fetchProjects}
      />
    </Card>
  );
};

export default ProjectsSection;
