
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ForumsList from '@/components/forums/ForumsList';
import ForumView from '@/components/forums/ForumView';
import CreateForumDialog from '@/components/forums/CreateForumDialog';
import CreatePostDialog from '@/components/forums/CreatePostDialog';
import { 
  getForums, 
  getForum, 
  getForumPosts, 
  createForum, 
  createForumPost,
  CreateForumData,
  CreateForumPostData
} from '@/api/forums';

const Forums = () => {
  const { forumId } = useParams<{ forumId?: string }>();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for dialogs
  const [isCreateForumOpen, setIsCreateForumOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Fetch all forums
  const forumsQuery = useQuery({
    queryKey: ['forums'],
    queryFn: getForums
  });

  // Fetch single forum if forumId is provided
  const forumQuery = useQuery({
    queryKey: ['forum', forumId],
    queryFn: () => getForum(forumId!),
    enabled: !!forumId
  });

  // Fetch forum posts if forumId is provided
  const forumPostsQuery = useQuery({
    queryKey: ['forumPosts', forumId],
    queryFn: () => getForumPosts(forumId!),
    enabled: !!forumId
  });

  // Create forum mutation
  const createForumMutation = useMutation({
    mutationFn: (data: CreateForumData) => createForum(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forums'] });
      setIsCreateForumOpen(false);
    }
  });

  // Create forum post mutation
  const createForumPostMutation = useMutation({
    mutationFn: (data: CreateForumPostData) => createForumPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts', forumId] });
      setIsCreatePostOpen(false);
    }
  });

  // Handle forum creation - use actual user data
  const handleCreateForum = async (data: CreateForumData) => {
    if (!user) return;
    
    await createForumMutation.mutateAsync({
      ...data,
      userId: user.id
    });
  };

  // Handle post creation - use actual user data
  const handleCreatePost = async (data: CreateForumPostData) => {
    if (!user) return;
    
    await createForumPostMutation.mutateAsync({
      ...data,
      userId: user.id,
      userName: user.name,
      userImage: user.image
    });
  };

  // Filter forums based on search query
  const filteredForums = forumsQuery.data?.filter(forum => 
    forum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    forum.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <MainLayout>
      <div className="container max-w-5xl">
        <div className="flex flex-col gap-6">
          {!forumId ? (
            // Forums List View
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Forums</h1>
                  <p className="text-muted-foreground">
                    Discover discussions and ask questions
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search forums..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {isAuthenticated && (
                    <Button onClick={() => setIsCreateForumOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Forum
                    </Button>
                  )}
                </div>
              </div>

              <ForumsList 
                forums={filteredForums} 
                isLoading={forumsQuery.isLoading} 
              />

              <CreateForumDialog
                open={isCreateForumOpen}
                onOpenChange={setIsCreateForumOpen}
                onSubmit={handleCreateForum}
                isSubmitting={createForumMutation.isPending}
              />
            </>
          ) : (
            // Single Forum View
            <>
              <ForumView
                forum={forumQuery.data ?? null}
                posts={forumPostsQuery.data ?? []}
                isLoading={forumQuery.isLoading || forumPostsQuery.isLoading}
                onNewPost={() => setIsCreatePostOpen(true)}
              />

              <CreatePostDialog
                forumId={forumId}
                open={isCreatePostOpen}
                onOpenChange={setIsCreatePostOpen}
                onSubmit={handleCreatePost}
                isSubmitting={createForumPostMutation.isPending}
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Forums;
