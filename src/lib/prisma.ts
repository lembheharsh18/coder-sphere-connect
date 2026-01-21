
// This file provides a Prisma client that works in both server and browser environments

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

let prisma;

if (isBrowser) {
  // In browser environments, provide a mock implementation that uses localStorage
  const mockPrismaClient = {
    user: {
      findUnique: (args: any) => {
        console.log("Browser mock: prisma.user.findUnique called with", args);
        try {
          // Check localStorage for user data
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const user = users.find((u: any) => 
            (args.where?.id && u.id === args.where.id) || 
            (args.where?.email && u.email === args.where.email)
          );
          return Promise.resolve(user || null);
        } catch (error) {
          console.error("Error accessing localStorage:", error);
          return Promise.resolve(null);
        }
      },
      create: (args: any) => {
        console.log("Browser mock: prisma.user.create called with", args);
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const newUser = {
            id: `user-${Date.now()}`,
            ...args.data
          };
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          return Promise.resolve(newUser);
        } catch (error) {
          console.error("Error updating localStorage:", error);
          return Promise.resolve({});
        }
      },
      update: (args: any) => {
        console.log("Browser mock: prisma.user.update called with", args);
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const index = users.findIndex((u: any) => u.id === args.where.id);
          if (index !== -1) {
            users[index] = { ...users[index], ...args.data };
            localStorage.setItem('users', JSON.stringify(users));
            return Promise.resolve(users[index]);
          }
          return Promise.resolve({});
        } catch (error) {
          console.error("Error updating localStorage:", error);
          return Promise.resolve({});
        }
      },
      delete: (args: any) => {
        console.log("Browser mock: prisma.user.delete called with", args);
        try {
          let users = JSON.parse(localStorage.getItem('users') || '[]');
          users = users.filter((u: any) => u.id !== args.where.id);
          localStorage.setItem('users', JSON.stringify(users));
          return Promise.resolve({});
        } catch (error) {
          console.error("Error updating localStorage:", error);
          return Promise.resolve({});
        }
      },
      // Add other methods as needed
    },
    notificationPreference: {
      upsert: (args: any) => {
        console.log("Browser mock: prisma.notificationPreference.upsert called with", args);
        try {
          const preferences = JSON.parse(localStorage.getItem('notificationPreferences') || '[]');
          const index = preferences.findIndex((p: any) => p.userId === args.where.userId);
          
          if (index !== -1) {
            preferences[index] = { ...preferences[index], ...args.update };
          } else {
            preferences.push({ id: `pref-${Date.now()}`, ...args.create });
          }
          
          localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
          return Promise.resolve(index !== -1 ? preferences[index] : preferences[preferences.length - 1]);
        } catch (error) {
          console.error("Error updating localStorage:", error);
          return Promise.resolve({});
        }
      },
      // Add other methods as needed
    },
    userSettings: {
      upsert: (args: any) => {
        console.log("Browser mock: prisma.userSettings.upsert called with", args);
        try {
          const settings = JSON.parse(localStorage.getItem('userSettings') || '[]');
          const index = settings.findIndex((s: any) => s.userId === args.where.userId);
          
          if (index !== -1) {
            settings[index] = { ...settings[index], ...args.update };
          } else {
            settings.push({ id: `settings-${Date.now()}`, ...args.create });
          }
          
          localStorage.setItem('userSettings', JSON.stringify(settings));
          return Promise.resolve(index !== -1 ? settings[index] : settings[settings.length - 1]);
        } catch (error) {
          console.error("Error updating localStorage:", error);
          return Promise.resolve({});
        }
      },
      // Add other methods as needed
    },
    forum: {
      findMany: () => {
        console.log("Browser mock: prisma.forum.findMany called");
        try {
          const forums = JSON.parse(localStorage.getItem('forums') || '[]');
          const forumPosts = JSON.parse(localStorage.getItem('forumPosts') || '{}');
          
          return Promise.resolve(forums.map((forum: any) => ({
            ...forum,
            _count: {
              posts: (forumPosts[forum.id] || []).length
            }
          })));
        } catch (error) {
          console.error("Error accessing localStorage:", error);
          return Promise.resolve([]);
        }
      },
      findUnique: (args: any) => {
        console.log("Browser mock: prisma.forum.findUnique called with", args);
        try {
          const forums = JSON.parse(localStorage.getItem('forums') || '[]');
          const forumPosts = JSON.parse(localStorage.getItem('forumPosts') || '{}');
          
          const forum = forums.find((f: any) => f.id === args.where.id);
          if (forum) {
            return Promise.resolve({
              ...forum,
              _count: {
                posts: (forumPosts[forum.id] || []).length
              }
            });
          }
          return Promise.resolve(null);
        } catch (error) {
          console.error("Error accessing localStorage:", error);
          return Promise.resolve(null);
        }
      },
      create: (args: any) => {
        console.log("Browser mock: prisma.forum.create called with", args);
        try {
          const forums = JSON.parse(localStorage.getItem('forums') || '[]');
          const newForum = {
            id: `forum-${Date.now()}`,
            ...args.data
          };
          forums.push(newForum);
          localStorage.setItem('forums', JSON.stringify(forums));
          return Promise.resolve(newForum);
        } catch (error) {
          console.error("Error updating localStorage:", error);
          return Promise.resolve({});
        }
      },
      // Add other methods as needed
    },
    forumPost: {
      findMany: (args: any) => {
        console.log("Browser mock: prisma.forumPost.findMany called with", args);
        try {
          const forumPosts = JSON.parse(localStorage.getItem('forumPosts') || '{}');
          const posts = forumPosts[args.where.forumId] || [];
          
          // Simulate including user data
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const postsWithUsers = posts.map((post: any) => {
            const user = users.find((u: any) => u.id === post.userId) || { name: "Unknown User", image: null };
            return {
              ...post,
              user: {
                name: user.name,
                image: user.image
              }
            };
          });
          
          return Promise.resolve(postsWithUsers);
        } catch (error) {
          console.error("Error accessing localStorage:", error);
          return Promise.resolve([]);
        }
      },
      create: (args: any) => {
        console.log("Browser mock: prisma.forumPost.create called with", args);
        try {
          const forumPosts = JSON.parse(localStorage.getItem('forumPosts') || '{}');
          const newPost = {
            id: `post-${Date.now()}`,
            ...args.data
          };
          
          if (!forumPosts[args.data.forumId]) {
            forumPosts[args.data.forumId] = [];
          }
          
          forumPosts[args.data.forumId].unshift(newPost);
          localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
          
          // Simulate including user data in the response
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const user = users.find((u: any) => u.id === args.data.userId) || { name: "Unknown User", image: null };
          
          return Promise.resolve({
            ...newPost,
            user: {
              name: user.name,
              image: user.image
            }
          });
        } catch (error) {
          console.error("Error updating localStorage:", error);
          return Promise.resolve({});
        }
      },
      // Add other methods as needed
    },
    // Add other models as needed
  };
  
  prisma = mockPrismaClient;
} else {
  // In Node.js environment, use the actual Prisma client
  // This code won't run in the browser
  try {
    // @ts-ignore - We know this will only run in Node
    const { PrismaClient } = require('@prisma/client');
    
    console.log("Server-side: Initializing PrismaClient with database URL:", 
      process.env.POSTGRES_PRISMA_URL ? "[URL found]" : "[URL not found]");
    
    const globalForPrisma = global as unknown as { prisma: any };
    
    prisma = globalForPrisma.prisma || new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
    
    console.log("PrismaClient initialized successfully");
  } catch (error) {
    console.error("Failed to initialize PrismaClient:", error);
    // Create a fallback mock client for server environments where Prisma fails to initialize
    prisma = {
      user: {
        findUnique: () => Promise.resolve(null),
        create: () => Promise.resolve({}),
        update: () => Promise.resolve({}),
        delete: () => Promise.resolve({}),
      },
      notificationPreference: {
        upsert: () => Promise.resolve({}),
      },
      userSettings: {
        upsert: () => Promise.resolve({}),
      },
      // Add other models as needed
    };
  }
}

export { prisma };
