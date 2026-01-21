
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Upload, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  imageUrl?: string;
  url?: string;
}

interface AddAchievementDialogProps {
  onAchievementAdded: (achievement: Achievement) => void;
}

const AddAchievementDialog: React.FC<AddAchievementDialogProps> = ({ onAchievementAdded }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('certification');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setCategory('certification');
    setUrl('');
    setImageUrl('');
    setIsPreviewMode(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !date || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newAchievement: Achievement = {
      id: `achievement-${Date.now()}`,
      title,
      description,
      date,
      category,
      imageUrl: imageUrl || undefined,
      url: url || undefined,
    };

    onAchievementAdded(newAchievement);
    toast.success("Achievement added successfully");
    setOpen(false);
    resetForm();
  };

  // Mock file upload function - in a real app, this would upload to a server
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImageUploading(true);
    
    // Simulate image upload delay
    setTimeout(() => {
      // In a real app, this would be the URL returned from the server
      setImageUrl(`https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`);
      setIsImageUploading(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Achievement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Achievement</DialogTitle>
          <DialogDescription>
            Share your accomplishment with the community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="AWS Certified Developer"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="award">Award</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date Achieved</Label>
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your achievement..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL (Optional)</Label>
            <Input 
              id="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://credential.example.com/verify/123456"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Image (Optional)</Label>
            {imageUrl ? (
              <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Label htmlFor="image" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {isImageUploading ? "Uploading..." : "Click to upload image"}
                  </span>
                </Label>
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isImageUploading}>Add Achievement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAchievementDialog;
