// API utility for calling backend endpoints
const API_BASE = 'http://localhost:8080/api';

export interface User {
  id: number;
  username?: string;  // From login endpoint
  user?: string;      // From other endpoints (backward compat)
  email: string;
  name: string;
  role: 'user' | 'admin';
  active: boolean;
  phone?: string;
  birthDate?: string;
  /** photo de profil (champ 'pp' dans la base) */
  pp?: string;
  avatar?: string;
  createdAt?: string;
  postsCount?: number;
}

export interface Post {
  id: number;
  content: string;
  time?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    user: string;
    pp?: string;
  };
}

// Auth
export async function login(username: string, password: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    
    // Extract token and user from response
    const { token, user: userData } = data;
    
    // Store token in localStorage for API requests
    if (token) {
      localStorage.setItem('authToken', token);
    }
    
    // Return only the user data (matching User interface)
    return userData as User;
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
}

export async function register(data: any): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Register failed');
    const responseData = await res.json();
    
    // Extract token and user from response (if register also returns them)
    if (responseData.token) {
      localStorage.setItem('authToken', responseData.token);
      return responseData.user || responseData;
    }
    
    return responseData;
  } catch (err) {
    console.error('Register error:', err);
    return null;
  }
}

// Users
export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Fetch users failed');
    const data = await res.json();
    return data.users || [];
  } catch (err) {
    console.error('Get users error:', err);
    return [];
  }
}

export async function getUser(id: number): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Fetch user failed');
    return res.json();
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
}

export async function updateUser(id: number, data: Partial<User>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('Update user error:', err);
    return false;
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Delete user error:', err);
    return false;
  }
}

// Posts
export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Fetch posts failed');
    const data = await res.json();
    return data.posts || [];
  } catch (err) {
    console.error('Get posts error:', err);
    return [];
  }
}

export async function getPost(id: number): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Fetch post failed');
    return res.json();
  } catch (err) {
    console.error('Get post error:', err);
    return null;
  }
}

export async function createPost(userId: number, content: string, time?: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, content, time }),
    });
    if (!res.ok) throw new Error('Create post failed');
    return res.json();
  } catch (err) {
    console.error('Create post error:', err);
    return null;
  }
}

export async function updatePost(id: number, content: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return res.ok;
  } catch (err) {
    console.error('Update post error:', err);
    return false;
  }
}

export async function deletePost(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Delete post error:', err);
    return false;
  }
}

// Local storage helpers
export function saveCurrentUser(user: User) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// Token management
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function clearAuthToken() {
  localStorage.removeItem('authToken');
}

// Helper to get headers with auth token
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function logout(): void {
  clearCurrentUser();
  clearAuthToken();
}
