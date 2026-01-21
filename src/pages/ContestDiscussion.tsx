
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContestDiscussions, createContestDiscussion, addCommentToDiscussion } from '@/api/contests';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CreateDiscussionForm from '@/components/contests/CreateDiscussionForm';
import DiscussionsList from '@/components/contests/DiscussionsList';
import { useToast } from '@/hooks/use-toast';

const ContestDiscussion = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch discussions for the contest
  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['contestDiscussions', contestId],
    queryFn: () => getContestDiscussions(contestId as string),
    enabled: !!contestId
  });

  // Create discussion mutation
  const createDiscussionMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) => 
      createContestDiscussion(
        contestId as string,
        data.title,
        data.content,
        user?.id || '',
        user?.name || '',
        user?.image
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contestDiscussions', contestId] });
      toast({
        description: "Discussion created successfully!",
      });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create discussion",
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (data: { discussionId: string; content: string }) => 
      addCommentToDiscussion(
        data.discussionId,
        contestId as string,
        data.content,
        user?.id || '',
        user?.name || '',
        user?.image
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contestDiscussions', contestId] });
      toast({
        description: "Comment added successfully!",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment",
      });
    }
  });

  const handleCreateDiscussion = async (data: { title: string; content: string }) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        description: "You must be logged in to create discussions",
      });
      return;
    }
    
    await createDiscussionMutation.mutateAsync(data);
  };

  const handleAddComment = async (discussionId: string, content: string) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        description: "You must be logged in to add comments",
      });
      return;
    }
    
    await addCommentMutation.mutateAsync({ discussionId, content });
  };

  return (
    <MainLayout>
      <div className="container max-w-5xl">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/competitions')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Contest Discussions</h1>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Discussions</CardTitle>
              {isAuthenticated && (
                <Button onClick={() => setIsFormOpen(!isFormOpen)}>
                  {isFormOpen ? 'Cancel' : 'New Discussion'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isFormOpen && (
                <CreateDiscussionForm 
                  onSubmit={handleCreateDiscussion} 
                  isSubmitting={createDiscussionMutation.isPending}
                />
              )}
              
              <DiscussionsList 
                discussions={discussions} 
                isLoading={isLoading} 
                onAddComment={handleAddComment}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContestDiscussion;
