
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { addProject } from '@/api/projects';
import { Plus, X } from 'lucide-react';

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddProjectDialog = ({ open, onOpenChange, onSuccess }: AddProjectDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [collaborator, setCollaborator] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to add a project",
        variant: "destructive"
      });
      return;
    }

    if (!title || !description) {
      toast({
        title: "Missing required fields",
        description: "Please enter a title and description",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addProject({
        title,
        description,
        repoUrl: repoUrl || undefined,
        demoUrl: demoUrl || undefined,
        userId: user.id,
        collaborators
      });

      toast({
        title: "Project added",
        description: "Your project has been added successfully",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setRepoUrl('');
      setDemoUrl('');
      setCollaborators([]);
      
      // Close dialog and trigger refresh
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCollaborator = () => {
    if (collaborator && !collaborators.includes(collaborator)) {
      setCollaborators([...collaborators, collaborator]);
      setCollaborator('');
    }
  };

  const removeCollaborator = (index: number) => {
    setCollaborators(collaborators.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Showcase your work by adding a new project to your profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Project"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your project"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="demoUrl">Demo URL</Label>
              <Input
                id="demoUrl"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://my-project-demo.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Collaborators</Label>
              <div className="flex gap-2">
                <Input
                  value={collaborator}
                  onChange={(e) => setCollaborator(e.target.value)}
                  placeholder="Add collaborator name"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={addCollaborator}
                  disabled={!collaborator}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {collaborators.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {collaborators.map((collab, index) => (
                    <div 
                      key={index} 
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1"
                    >
                      <span>{collab}</span>
                      <button 
                        type="button" 
                        onClick={() => removeCollaborator(index)}
                        className="text-secondary-foreground hover:text-primary transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
