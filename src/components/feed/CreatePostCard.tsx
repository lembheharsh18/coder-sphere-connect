
import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, FileText, Send, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { createFeedPost } from '@/api/feed';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostCardProps {
  onPostCreated?: () => void;
}

const CreatePostCard: React.FC<CreatePostCardProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setSelectedImages((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && selectedImages.length === 0) {
      toast.error("Please enter some content or add an image");
      return;
    }

    if (!user) {
      toast.error("Please log in to create a post");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const media = selectedImages.map((url) => ({ type: 'image' as const, url }));
      await createFeedPost(content, user.id, media.length > 0 ? media : undefined);
      
      toast.success("Post created successfully!");
      setContent('');
      setSelectedImages([]);
      setIsExpanded(false);
      
      if (onPostCreated) onPostCreated();
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="mb-4 border-border bg-card shadow-sm">
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 border">
            {user?.image ? (
              <AvatarImage src={user.image} alt={user.name || 'User'} />
            ) : (
              <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
            )}
          </Avatar>
          
          {isExpanded ? (
            <form className="flex-1" onSubmit={handleSubmit}>
              <textarea
                className="w-full p-3 rounded-lg border border-border bg-background resize-none min-h-[100px]"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
                disabled={isSubmitting}
              />

              {/* Image previews */}
              {selectedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Selected ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="h-4 w-4 mr-1" />
                    <span>Photo</span>
                  </Button>
                  <Button type="button" variant="outline" size="sm" disabled={isSubmitting}>
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Document</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false);
                      setSelectedImages([]);
                      setContent('');
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsExpanded(true)}
              className="flex-1 text-left p-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors"
              disabled={isSubmitting}
            >
              Start a post...
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePostCard;
