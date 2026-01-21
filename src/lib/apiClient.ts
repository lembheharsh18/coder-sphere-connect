// API Client for CoderSphere
// All API calls go through this client to communicate with the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
  
  public async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }
    
    return data;
  }
  
  // ==================== AUTH ====================
  
  async register(name: string, email: string, password: string) {
    return this.request<{
      success: boolean;
      message: string;
      user?: any;
      token?: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }
  
  async login(email: string, password: string) {
    return this.request<{
      success: boolean;
      message: string;
      user?: any;
      token?: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
  
  async googleAuth(googleId: string, name: string, email: string, image: string) {
    return this.request<{
      success: boolean;
      user?: any;
      token?: string;
    }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ googleId, name, email, image }),
    });
  }
  
  async getCurrentUser() {
    return this.request<{ success: boolean; user: any }>('/api/auth/me');
  }
  
  // ==================== USERS ====================
  
  async getUsers() {
    return this.request<{ success: boolean; users: any[] }>('/api/users');
  }
  
  async updateUser(id: string, data: any) {
    return this.request<{ success: boolean; user: any }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  // ==================== CONNECTIONS ====================
  
  async getConnections() {
    return this.request<{ success: boolean; connections: any[] }>('/api/connections');
  }
  
  async getPendingConnections() {
    return this.request<{ success: boolean; pendingRequests: any[] }>('/api/connections/pending');
  }
  
  async sendConnectionRequest(connectedUserId: string) {
    return this.request<{ success: boolean; connection: any }>('/api/connections', {
      method: 'POST',
      body: JSON.stringify({ connectedUserId }),
    });
  }
  
  async updateConnection(id: string, status: string) {
    return this.request<{ success: boolean; connection: any }>(`/api/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
  
  // ==================== MESSAGES ====================
  
  async getConversations() {
    return this.request<{ success: boolean; conversations: any[] }>('/api/conversations');
  }
  
  async getMessages(conversationId: string) {
    return this.request<{ success: boolean; messages: any[] }>(
      `/api/conversations/${conversationId}/messages`
    );
  }
  
  async sendMessage(data: { conversationId?: string; receiverId: string; content: string }) {
    return this.request<{ success: boolean; message: any }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // ==================== FORUMS ====================
  
  async getForums() {
    return this.request<{ success: boolean; forums: any[] }>('/api/forums');
  }
  
  async createForum(title: string, description: string) {
    return this.request<{ success: boolean; forum: any }>('/api/forums', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  }
  
  async getForumPosts(forumId: string) {
    return this.request<{ success: boolean; posts: any[] }>(`/api/forums/${forumId}/posts`);
  }
  
  async createForumPost(forumId: string, title: string, content: string) {
    return this.request<{ success: boolean; post: any }>(`/api/forums/${forumId}/posts`, {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }
  
  // ==================== PROJECTS ====================
  
  async getProjects() {
    return this.request<{ success: boolean; projects: any[] }>('/api/projects');
  }
  
  async createProject(data: { title: string; description: string; repoUrl?: string; demoUrl?: string }) {
    return this.request<{ success: boolean; project: any }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // ==================== POSTS/FEED ====================
  
  async getPosts() {
    return this.request<{ success: boolean; posts: any[] }>('/api/posts');
  }
  
  async createPost(title: string, content: string) {
    return this.request<{ success: boolean; post: any }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }
  
  async addComment(postId: string, content: string) {
    return this.request<{ success: boolean; comment: any }>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async deletePost(postId: string) {
    return this.request<{ success: boolean }>(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async likePost(postId: string) {
    return this.request<{ success: boolean; likesCount: number; hasLiked: boolean }>(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(postId: string) {
    return this.request<{ success: boolean; likesCount: number; hasLiked: boolean }>(`/api/posts/${postId}/like`, {
      method: 'DELETE',
    });
  }
  
  // ==================== CHATBOT ====================
  
  async chat(message: string, history?: string) {
    return this.request<{ success: boolean; response: string; fallback?: boolean }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  }
  
  // ==================== CONTESTS ====================
  
  async getCodeforcesContests() {
    return this.request<{ success: boolean; contests: any[] }>('/api/contests/codeforces');
  }

  async getContestSolutions(contestId: string) {
    return this.request<{ success: boolean; solutions: any[] }>(`/api/contests/${contestId}/solutions`);
  }

  async createContestSolution(contestId: string, data: { title: string; code: string; language: string; problemNumber?: string }) {
    return this.request<{ success: boolean; solution: any }>(`/api/contests/${contestId}/solutions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  
  // ==================== SETTINGS ====================
  
  async getSettings() {
    return this.request<{ success: boolean; settings: any; preferences: any }>('/api/settings');
  }
  
  async updateSettings(data: any) {
    return this.request<{ success: boolean; settings: any }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async updateNotificationPreferences(data: any) {
    return this.request<{ success: boolean; preferences: any }>('/api/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// Export types
export type { ApiClient };
