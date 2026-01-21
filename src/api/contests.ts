
import { prisma } from '@/lib/prisma';

interface Contest {
  id: string;
  name: string;
  platform: string;
  startTime: string;
  endTime: string;
  url: string;
  description: string;
}

interface ContestDiscussion {
  id: string;
  contestId: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  createdAt: string;
  comments?: ContestComment[];
}

interface ContestComment {
  id: string;
  discussionId: string;
  content: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  createdAt: string;
}

// Get all contests
export const getContests = async (): Promise<Contest[]> => {
  // In a browser environment, simulate API call
  if (typeof window !== 'undefined') {
    try {
      const storedContests = localStorage.getItem('contests');
      if (storedContests) {
        return JSON.parse(storedContests);
      }
      
      // Create some mock contests for first-time users
      const mockContests = [
        {
          id: 'contest-1',
          name: 'Weekly Coding Challenge',
          platform: 'LeetCode',
          startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(), // tomorrow + 2 hours
          url: 'https://leetcode.com/contest/',
          description: 'Weekly algorithmic programming contest'
        },
        {
          id: 'contest-2',
          name: 'CodeForces Round',
          platform: 'CodeForces',
          startTime: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
          endTime: new Date(Date.now() + 172800000 + 7200000).toISOString(), // day after tomorrow + 2 hours
          url: 'https://codeforces.com/contests',
          description: 'Competitive programming contest with rating changes'
        }
      ];
      
      localStorage.setItem('contests', JSON.stringify(mockContests));
      return mockContests;
    } catch (error) {
      console.error('Error fetching contests:', error);
      return [];
    }
  }

  // Server-side implementation would use Prisma
  try {
    // Assuming Contest would be a model in your Prisma schema
    const contests = await prisma.contestNotification.findMany({
      select: {
        id: true,
        contestName: true,
        platform: true,
        startTime: true,
        endTime: true,
        contestUrl: true
      }
    });
    
    // Transform to match the Contest interface
    return contests.map(contest => ({
      id: contest.id,
      name: contest.contestName,
      platform: contest.platform,
      startTime: contest.startTime.toISOString(),
      endTime: contest.endTime.toISOString(),
      url: contest.contestUrl,
      description: '' // Default empty as it's not in your schema
    }));
  } catch (error) {
    console.error('Error fetching contests:', error);
    throw new Error('Failed to fetch contests');
  }
};

// Get discussions for a contest
export const getContestDiscussions = async (contestId: string): Promise<ContestDiscussion[]> => {
  // In a browser environment, simulate API call
  if (typeof window !== 'undefined') {
    try {
      const storedDiscussions = localStorage.getItem(`discussions-${contestId}`);
      return storedDiscussions ? JSON.parse(storedDiscussions) : [];
    } catch (error) {
      console.error('Error fetching contest discussions:', error);
      return [];
    }
  }

  // Server-side implementation would need appropriate Prisma models
  try {
    // This would require adding ContestDiscussion and Comment models to your Prisma schema
    /*
    const discussions = await prisma.contestDiscussion.findMany({
      where: { contestId },
      include: {
        user: { select: { name: true, image: true } },
        comments: {
          include: {
            user: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return discussions.map(d => ({
      id: d.id,
      contestId: d.contestId,
      title: d.title,
      content: d.content,
      userId: d.userId,
      userName: d.user.name,
      userImage: d.user.image,
      createdAt: d.createdAt.toISOString(),
      comments: d.comments.map(c => ({
        id: c.id,
        discussionId: c.discussionId,
        content: c.content,
        userId: c.userId,
        userName: c.user.name,
        userImage: c.user.image,
        createdAt: c.createdAt.toISOString()
      }))
    }));
    */
    
    // Placeholder until schema is updated
    return [];
  } catch (error) {
    console.error('Error fetching contest discussions:', error);
    throw new Error('Failed to fetch contest discussions');
  }
};

// Create a discussion for a contest
export const createContestDiscussion = async (
  contestId: string, 
  title: string, 
  content: string, 
  userId: string, 
  userName: string, 
  userImage?: string | null
): Promise<ContestDiscussion> => {
  // In a browser environment, simulate API call
  if (typeof window !== 'undefined') {
    try {
      const id = `discussion-${Date.now()}`;
      const newDiscussion = {
        id,
        contestId,
        title,
        content,
        userId,
        userName,
        userImage,
        createdAt: new Date().toISOString(),
        comments: []
      };

      const storedDiscussions = localStorage.getItem(`discussions-${contestId}`) || '[]';
      const discussions = JSON.parse(storedDiscussions);
      
      discussions.unshift(newDiscussion);
      localStorage.setItem(`discussions-${contestId}`, JSON.stringify(discussions));

      return newDiscussion;
    } catch (error) {
      console.error('Error creating contest discussion:', error);
      throw new Error('Failed to create discussion');
    }
  }

  // Server-side implementation would need appropriate Prisma models
  try {
    // This would require adding ContestDiscussion model to your Prisma schema
    /*
    const discussion = await prisma.contestDiscussion.create({
      data: {
        contestId,
        title,
        content,
        userId
      },
      include: {
        user: { select: { name: true, image: true } }
      }
    });
    
    return {
      id: discussion.id,
      contestId: discussion.contestId,
      title: discussion.title,
      content: discussion.content,
      userId: discussion.userId,
      userName: discussion.user.name,
      userImage: discussion.user.image,
      createdAt: discussion.createdAt.toISOString(),
      comments: []
    };
    */
    
    // Placeholder until schema is updated
    return {
      id: 'mock-id',
      contestId,
      title,
      content,
      userId,
      userName,
      userImage,
      createdAt: new Date().toISOString(),
      comments: []
    };
  } catch (error) {
    console.error('Error creating contest discussion:', error);
    throw new Error('Failed to create discussion');
  }
};

// Add a comment to a discussion
export const addCommentToDiscussion = async (
  discussionId: string,
  contestId: string,
  content: string,
  userId: string,
  userName: string,
  userImage?: string | null
): Promise<ContestComment> => {
  // In a browser environment, simulate API call
  if (typeof window !== 'undefined') {
    try {
      const id = `comment-${Date.now()}`;
      const newComment = {
        id,
        discussionId,
        content,
        userId,
        userName,
        userImage,
        createdAt: new Date().toISOString()
      };

      const storedDiscussions = localStorage.getItem(`discussions-${contestId}`) || '[]';
      const discussions = JSON.parse(storedDiscussions);
      
      const discussionIndex = discussions.findIndex((d: ContestDiscussion) => d.id === discussionId);
      
      if (discussionIndex === -1) throw new Error('Discussion not found');
      
      if (!discussions[discussionIndex].comments) {
        discussions[discussionIndex].comments = [];
      }
      
      discussions[discussionIndex].comments.push(newComment);
      localStorage.setItem(`discussions-${contestId}`, JSON.stringify(discussions));

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  // Server-side implementation would need appropriate Prisma models
  try {
    // This would require adding Comment model to your Prisma schema
    /*
    const comment = await prisma.contestComment.create({
      data: {
        discussionId,
        content,
        userId
      },
      include: {
        user: { select: { name: true, image: true } }
      }
    });
    
    return {
      id: comment.id,
      discussionId: comment.discussionId,
      content: comment.content,
      userId: comment.userId,
      userName: comment.user.name,
      userImage: comment.user.image,
      createdAt: comment.createdAt.toISOString()
    };
    */
    
    // Placeholder until schema is updated
    return {
      id: 'mock-comment-id',
      discussionId,
      content,
      userId,
      userName,
      userImage,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
};
