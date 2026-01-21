
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
import { addBadge } from '@/api/achievements';

interface AddBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddBadgeDialog = ({ open, onOpenChange, onSuccess }: AddBadgeDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [points, setPoints] = useState<number>(10); // Default points value

  // Predefined badge images
  const badgeImages = [
    'https://cdn.iconscout.com/icon/free/png-256/free-medal-559-433664.png',
    'https://cdn.iconscout.com/icon/free/png-256/free-github-1521500-1288242.png',
    'https://cdn.iconscout.com/icon/free/png-256/free-customer-review-1767893-1505154.png',
    'https://cdn.iconscout.com/icon/free/png-256/free-certificate-1624774-1379633.png',
    'https://cdn.iconscout.com/icon/free/png-256/free-award-2636509-2187066.png'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to add an achievement",
        variant: "destructive"
      });
      return;
    }

    if (!name || !description || !image) {
      toast({
        title: "Missing required fields",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addBadge({
        name,
        description,
        image,
        points,
        userId: user.id,
        earnedDate: new Date().toISOString()
      });

      toast({
        title: "Achievement added",
        description: "Your achievement has been added successfully",
      });

      // Reset form
      setName('');
      setDescription('');
      setImage('');
      setPoints(10);
      
      // Close dialog and trigger refresh
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add achievement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Achievement</DialogTitle>
            <DialogDescription>
              Add an achievement or certification to showcase your accomplishments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Achievement Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Certified Developer"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your achievement"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="points">Achievement Points *</Label>
              <Input
                id="points"
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                placeholder="10"
                min="0"
                max="1000"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Select Badge Image *</Label>
              <div className="flex flex-wrap gap-4 justify-center">
                {badgeImages.map((badgeUrl) => (
                  <div 
                    key={badgeUrl} 
                    onClick={() => setImage(badgeUrl)}
                    className={`
                      p-2 border rounded-md cursor-pointer transition-all
                      ${image === badgeUrl ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-border'}
                    `}
                  >
                    <img src={badgeUrl} alt="Badge" className="w-12 h-12 object-contain" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="customImage">Or enter image URL</Label>
              <Input
                id="customImage"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/badge-image.png"
              />
            </div>
            
            {image && (
              <div className="flex justify-center">
                <div className="border p-4 rounded-md">
                  <img src={image} alt="Selected badge" className="w-16 h-16 object-contain" />
                </div>
              </div>
            )}
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
            <Button type="submit" disabled={isSubmitting || !name || !description || !image}>
              {isSubmitting ? 'Adding...' : 'Add Achievement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBadgeDialog;
