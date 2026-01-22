// Backend API Server for CoderSphere
// This server handles all database operations and external API calls

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:5173', 'https://coder-sphere-connect.vercel.app'],
    credentials: true,
  },
});

// Initialize Prisma with adapter
const adapter = new PrismaPg({ connectionString: process.env.POSTGRES_PRISMA_URL });
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 3001;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '');

// Store connected users: Map<userId, socketId>
const connectedUsers = new Map<string, string>();

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Auth Middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== SOCKET.IO HANDLERS ====================

io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id);

  // User authentication via socket
  socket.on('authenticate', (token: string) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded.id;
      
      // Store user connection
      connectedUsers.set(userId, socket.id);
      socket.data.userId = userId;
      
      // Join user's personal room
      socket.join(`user:${userId}`);
      
      console.log(`✅ User ${userId} authenticated and connected`);
      
      // Notify user's connections that they're online
      io.emit('userOnline', { userId });
    } catch (error) {
      console.error('Socket authentication failed:', error);
      socket.emit('authError', { message: 'Authentication failed' });
    }
  });

  // Join a conversation room
  socket.on('joinConversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Leave a conversation room
  socket.on('leaveConversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Handle sending a message
  socket.on('sendMessage', async (data: { conversationId: string; receiverId: string; content: string }) => {
    const userId = socket.data.userId;
    if (!userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      // Create message in database
      const message = await prisma.message.create({
        data: {
          content: data.content,
          senderId: userId,
          receiverId: data.receiverId,
          conversationId: data.conversationId,
        },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });

      // Emit to all users in the conversation
      io.to(`conversation:${data.conversationId}`).emit('newMessage', message);
      
      // Also emit to receiver's personal room for notifications
      io.to(`user:${data.receiverId}`).emit('messageNotification', {
        conversationId: data.conversationId,
        message,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
    const userId = socket.data.userId;
    if (!userId) return;
    
    socket.to(`conversation:${data.conversationId}`).emit('userTyping', {
      userId,
      isTyping: data.isTyping,
    });
  });

  // Handle read receipts
  socket.on('markAsRead', async (data: { conversationId: string }) => {
    const userId = socket.data.userId;
    if (!userId) return;

    try {
      await prisma.message.updateMany({
        where: {
          conversationId: data.conversationId,
          receiverId: userId,
          read: false,
        },
        data: { read: true },
      });

      // Update last read timestamp
      await prisma.userConversation.updateMany({
        where: {
          conversationId: data.conversationId,
          userId,
        },
        data: { lastReadAt: new Date() },
      });

      socket.to(`conversation:${data.conversationId}`).emit('messagesRead', {
        userId,
        conversationId: data.conversationId,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      connectedUsers.delete(userId);
      io.emit('userOffline', { userId });
      console.log(`❌ User ${userId} disconnected`);
    }
  });
});

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        bio: user.bio,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        location: user.location,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        bio: user.bio,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        location: user.location,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Google Auth
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, name, email, image } = req.body;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          image,
        },
      });
    } else {
      // Update image if user exists
      user = await prisma.user.update({
        where: { email },
        data: { image },
      });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bio: true,
        githubUrl: true,
        linkedinUrl: true,
        location: true,
      },
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
});

// ==================== USER ROUTES ====================

// Update user profile
app.put('/api/users/:id', authMiddleware, async (req: any, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, bio, githubUrl, linkedinUrl, location, image } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, bio, githubUrl, linkedinUrl, location, image },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update user password
app.put('/api/users/:id/password', authMiddleware, async (req: any, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { currentPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    
    if (!user || !user.password) {
      return res.status(400).json({ error: 'User not found or no password set' });
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Delete user account
app.delete('/api/users/:id', authMiddleware, async (req: any, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Delete related data first
    await prisma.comment.deleteMany({ where: { userId: req.params.id } });
    await prisma.post.deleteMany({ where: { userId: req.params.id } });
    await prisma.userSettings.deleteMany({ where: { userId: req.params.id } });
    await prisma.notificationPreference.deleteMany({ where: { userId: req.params.id } });
    
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Get all users (for connections)
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
      },
      take: 50,
    });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ==================== CONNECTIONS ROUTES ====================

// Get user connections
app.get('/api/connections', authMiddleware, async (req: any, res) => {
  try {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: req.user.id, status: 'ACCEPTED' },
          { connectedUserId: req.user.id, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: { select: { id: true, name: true, image: true, bio: true } },
        connectedUser: { select: { id: true, name: true, image: true, bio: true } },
      },
    });
    res.json({ success: true, connections });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Get pending connection requests
app.get('/api/connections/pending', authMiddleware, async (req: any, res) => {
  try {
    const pendingRequests = await prisma.connection.findMany({
      where: {
        connectedUserId: req.user.id,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, image: true, bio: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, pendingRequests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// Send connection request
app.post('/api/connections', authMiddleware, async (req: any, res) => {
  try {
    const { connectedUserId } = req.body;
    
    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId: req.user.id, connectedUserId },
          { userId: connectedUserId, connectedUserId: req.user.id },
        ],
      },
    });
    
    if (existingConnection) {
      return res.status(400).json({ error: 'Connection already exists' });
    }
    
    const connection = await prisma.connection.create({
      data: {
        userId: req.user.id,
        connectedUserId,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
    
    // Real-time notification to the target user
    const targetSocketId = connectedUsers.get(connectedUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('connectionNotification', {
        type: 'connection_request',
        fromUser: {
          id: connection.user.id,
          name: connection.user.name,
          image: connection.user.image,
        },
        connectionId: connection.id,
        createdAt: connection.createdAt.toISOString(),
      });
    }
    
    res.json({ success: true, connection });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
});

// Accept/reject connection
app.put('/api/connections/:id', authMiddleware, async (req: any, res) => {
  try {
    const { status } = req.body;
    
    const connection = await prisma.connection.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, image: true } },
        connectedUser: { select: { id: true, name: true, image: true } },
      },
    });
    
    // If accepted, notify the requester in real-time
    if (status === 'ACCEPTED') {
      const requesterSocketId = connectedUsers.get(connection.userId);
      if (requesterSocketId) {
        io.to(requesterSocketId).emit('connectionNotification', {
          type: 'connection_accepted',
          fromUser: {
            id: connection.connectedUser.id,
            name: connection.connectedUser.name,
            image: connection.connectedUser.image,
          },
          connectionId: connection.id,
          createdAt: new Date().toISOString(),
        });
      }
    }
    
    res.json({ success: true, connection });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

// ==================== MESSAGES ROUTES ====================

// Get conversations
app.get('/api/conversations', authMiddleware, async (req: any, res) => {
  try {
    const conversations = await prisma.userConversation.findMany({
      where: { userId: req.user.id },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            participants: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
    });
    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages in a conversation
app.get('/api/conversations/:id/messages', authMiddleware, async (req: any, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
app.post('/api/messages', authMiddleware, async (req: any, res) => {
  try {
    const { conversationId, receiverId, content } = req.body;
    
    let convId = conversationId;
    
    // Create conversation if it doesn't exist
    if (!convId) {
      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: req.user.id },
              { userId: receiverId },
            ],
          },
        },
      });
      convId = conversation.id;
    }
    
    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        receiverId,
        conversationId: convId,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });
    
    res.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ==================== FORUMS ROUTES ====================

// Get all forums
app.get('/api/forums', async (req, res) => {
  try {
    const forums = await prisma.forum.findMany({
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { posts: true } },
      },
    });
    res.json({ success: true, forums });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forums' });
  }
});

// Create forum
app.post('/api/forums', authMiddleware, async (req: any, res) => {
  try {
    const { title, description } = req.body;
    
    const forum = await prisma.forum.create({
      data: {
        title,
        description,
        userId: req.user.id,
      },
    });
    
    res.json({ success: true, forum });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create forum' });
  }
});

// Get forum posts
app.get('/api/forums/:id/posts', async (req, res) => {
  try {
    const posts = await prisma.forumPost.findMany({
      where: { forumId: req.params.id },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create forum post
app.post('/api/forums/:id/posts', authMiddleware, async (req: any, res) => {
  try {
    const { title, content } = req.body;
    
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        forumId: req.params.id,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
    
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ==================== PROJECTS ROUTES ====================

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project
app.post('/api/projects', authMiddleware, async (req: any, res) => {
  try {
    const { title, description, repoUrl, demoUrl } = req.body;
    
    const project = await prisma.project.create({
      data: {
        title,
        description,
        repoUrl,
        demoUrl,
        userId: req.user.id,
      },
    });
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ==================== POSTS/FEED ROUTES ====================

// Get all posts (feed)
app.get('/api/posts', async (req, res) => {
  try {
    // Get user ID from auth header if available
    let currentUserId: string | null = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        currentUserId = decoded.id;
      } catch {}
    }

    const posts = await prisma.post.findMany({
      include: {
        user: { select: { id: true, name: true, image: true, role: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Transform posts to include like count and hasLiked
    const transformedPosts = posts.map((post) => ({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      hasLiked: currentUserId ? post.likes.some((like) => like.userId === currentUserId) : false,
      likes: undefined,
      _count: undefined,
    }));

    res.json({ success: true, posts: transformedPosts });
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create post
app.post('/api/posts', authMiddleware, async (req: any, res) => {
  try {
    const { title, content } = req.body;
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
    
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Add comment to post
app.post('/api/posts/:id/comments', authMiddleware, async (req: any, res) => {
  try {
    const { content } = req.body;
    
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: req.params.id,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
    
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Delete post
app.delete('/api/posts/:id', authMiddleware, async (req: any, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    // Delete comments first (cascade)
    await prisma.comment.deleteMany({
      where: { postId: req.params.id },
    });
    
    await prisma.post.delete({
      where: { id: req.params.id },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Like a post
app.post('/api/posts/:id/like', authMiddleware, async (req: any, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Already liked this post' });
    }

    await prisma.like.create({
      data: { userId, postId },
    });

    // Get updated like count
    const likesCount = await prisma.like.count({
      where: { postId },
    });

    res.json({ success: true, likesCount, hasLiked: true });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Unlike a post
app.delete('/api/posts/:id/like', authMiddleware, async (req: any, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    await prisma.like.deleteMany({
      where: { userId, postId },
    });

    // Get updated like count
    const likesCount = await prisma.like.count({
      where: { postId },
    });

    res.json({ success: true, likesCount, hasLiked: false });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

// ==================== CHATBOT ROUTES ====================

// Chat with AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const systemPrompt = `You are CoderSphere's AI coding assistant. You help developers with:
- Programming questions and debugging
- Code explanations and best practices  
- Algorithm and data structure guidance
- Web development (React, TypeScript, CSS, etc.)
- Competitive programming tips for LeetCode, Codeforces, CodeChef
- General software development advice

Keep responses concise, helpful, and focused on coding. Use code examples when relevant.
Format code blocks properly using markdown syntax.`;

    const prompt = `${systemPrompt}\n\n${history ? `Previous conversation:\n${history}\n\n` : ''}User: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response', fallback: true });
  }
});

// ==================== CONTESTS ROUTES ====================

// Get contests from Codeforces API
app.get('/api/contests/codeforces', async (req, res) => {
  try {
    const response = await fetch('https://codeforces.com/api/contest.list');
    const data = await response.json();
    
    if (data.status === 'OK') {
      const now = Date.now() / 1000;
      const contests = data.result
        .filter((c: any) => c.startTimeSeconds >= now - 7 * 24 * 60 * 60)
        .slice(0, 20);
      res.json({ success: true, contests });
    } else {
      res.status(500).json({ error: 'Failed to fetch contests' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
});

// Get contest solutions
app.get('/api/contests/:id/solutions', async (req, res) => {
  try {
    const solutions = await prisma.contestSolution.findMany({
      where: { contestId: req.params.id },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, solutions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch solutions' });
  }
});

// Create contest solution
app.post('/api/contests/:id/solutions', authMiddleware, async (req: any, res) => {
  try {
    const { title, code, language, problemNumber } = req.body;
    
    const solution = await prisma.contestSolution.create({
      data: {
        title,
        code,
        language,
        problemNumber,
        contestId: req.params.id,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
    
    res.json({ success: true, solution });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create solution' });
  }
});


// ==================== SETTINGS ROUTES ====================

// Get user settings
app.get('/api/settings', authMiddleware, async (req: any, res) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.user.id },
    });
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: req.user.id },
    });
    res.json({ success: true, settings, preferences });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
app.put('/api/settings', authMiddleware, async (req: any, res) => {
  try {
    const { theme, codeEditorTheme, enableEmailDigest } = req.body;
    
    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      update: { theme, codeEditorTheme, enableEmailDigest },
      create: { userId: req.user.id, theme, codeEditorTheme, enableEmailDigest },
    });
    
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Update notification preferences
app.put('/api/settings/notifications', authMiddleware, async (req: any, res) => {
  try {
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: req.user.id },
      update: req.body,
      create: { userId: req.user.id, ...req.body },
    });
    
    res.json({ success: true, preferences });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  // Handle SPA routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Start server with Socket.io
httpServer.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io enabled for real-time features`);
  console.log(`📦 Database: ${process.env.POSTGRES_HOST || 'local'}`);
});

export { app, io, httpServer };
