// API utility for calling backend endpoints
const API_BASE = import.meta.env.VITE_API_URL;

// Extract backend origin from API_BASE (e.g., "http://localhost:8080/api" -> "http://localhost:8080")
const BACKEND_ORIGIN = API_BASE.replace(/\/api$/, '');

export interface User {
  id: number;
  username?: string;  // From login endpoint
  user?: string;      // From other endpoints (backward compat)
  email: string;
  name: string;
  role: 'user' | 'admin';
  active: boolean;
  blocked?: boolean;
  readOnly?: boolean;  // Read-only mode
  pinnedPostId?: number;  // ID of pinned post
  phone?: string;
  birthDate?: string;
  pp?: string;
  banner?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatar?: string;
  createdAt?: string;
  postsCount?: number;
  followers?: number;
  following?: number;
  isFollowing?: boolean;
}

export interface Post {
  id: number;
  content: string;
  time?: string;
  createdAt: string;
  mediaUrl?: string;
  likes?: number;
  liked?: boolean;
  retweets?: number;
  retweeted?: boolean;
  repliesCount?: number;
  censored?: boolean;
  user: {
    id: number;
    name: string;
    user: string;
    pp?: string;
    blocked?: boolean;
    readOnly?: boolean;
  };
}

export interface Reply {
  id: number;
  postId: number;
  content: string;
  createdAt: string;
  canDelete?: boolean;
  user: {
    id: number;
    username: string;
    displayName: string;
    pp?: string;
    blocked?: boolean;
  };
}

// Auth
export async function login(username: string, password: string): Promise<{user?: User, error?: string}> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      const errorMessage = data.message || data.error || 'Erreur lors de la connexion';
      console.error('Login API error:', errorMessage);
      return { error: errorMessage };
    }
    
    // Extract token and user from response
    const { token, user: userData } = data;
    
    // Store token in localStorage for API requests
    if (token) {
      console.log('✓ Token received from login:', token.substring(0, 20) + '...');
      localStorage.setItem('authToken', token);
      console.log('✓ Token saved to localStorage');
    }
    
    // Return only the user data (matching User interface)
    return { user: userData as User };
  } catch (err) {
    console.error('Login error:', err);
    return { error: 'Erreur de connexion au serveur' };
  }
}

export async function register(data: any): Promise<{user?: User, error?: string}> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const responseData = await res.json();
    
    if (!res.ok) {
      // Return error message from backend (e.g., "Cet utilisateur existe déjà", "Cet email est déjà utilisé")
      const errorMessage = responseData.error || 'Erreur lors de l\'inscription';
      console.error('Register API error:', errorMessage);
      return { error: errorMessage };
    }
    
    // Extract token and user from response
    if (responseData.token) {
      console.log('✓ Token received from register:', responseData.token.substring(0, 20) + '...');
      localStorage.setItem('authToken', responseData.token);
      console.log('✓ Token saved to localStorage');
      return { user: responseData.user || responseData };
    }
    
    return { user: responseData };
  } catch (err) {
    console.error('Register error:', err);
    return { error: 'Erreur de connexion au serveur' };
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

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const users = await getUsers();
    // Find user by username (field 'user' or 'username')
    const user = users.find(u => (u.user === username || u.username === username));
    return user || null;
  } catch (err) {
    console.error('Get user by username error:', err);
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

export async function toggleUserReadOnly(id: number, readOnly: boolean): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ readOnly }),
    });
    if (!res.ok) throw new Error('Toggle readOnly failed');
    return res.json();
  } catch (err) {
    console.error('Toggle readOnly error:', err);
    return null;
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
export async function getPosts(filter?: string): Promise<Post[]> {
  try {
    const url = filter ? `${API_BASE}/posts?filter=${filter}` : `${API_BASE}/posts`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Fetch posts failed');
    const data = await res.json();
    const posts = data.posts || [];
    
    // Normaliser les URLs des médias avec l'origine du backend
    return posts.map((post: Post) => ({
      ...post,
      mediaUrl: post.mediaUrl && !post.mediaUrl.startsWith('http')
        ? `${BACKEND_ORIGIN}${post.mediaUrl}`
        : post.mediaUrl,
    }));
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
    const post = await res.json();
    
    // Normaliser l'URL du média avec l'origine du backend
    return {
      ...post,
      mediaUrl: post.mediaUrl && !post.mediaUrl.startsWith('http')
        ? `${BACKEND_ORIGIN}${post.mediaUrl}`
        : post.mediaUrl,
    };
  } catch (err) {
    console.error('Get post error:', err);
    return null;
  }
}

export async function createPost(userId: number, content: string, time?: string, mediaUrl?: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, content, time, ...(mediaUrl && { mediaUrl }) }),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Delete post error:', err);
    return false;
  }
}

// Likes
export async function likePost(postId: number): Promise<{success: boolean, error?: string}> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return { success: true };
    } else {
      try {
        const data = await res.json();
        return { success: false, error: data.error || 'Erreur lors du like. Veuillez réessayer.' };
      } catch {
        return { success: false, error: 'Erreur lors du like. Veuillez réessayer.' };
      }
    }
  } catch (err) {
    console.error('Like post error:', err);
    return { success: false, error: 'Erreur lors du like. Veuillez réessayer.' };
  }
}

export async function unlikePost(postId: number): Promise<{success: boolean, error?: string}> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return { success: true };
    } else {
      try {
        const data = await res.json();
        return { success: false, error: data.error || 'Erreur lors du retrait du like. Veuillez réessayer.' };
      } catch {
        return { success: false, error: 'Erreur lors du retrait du like. Veuillez réessayer.' };
      }
    }
  } catch (err) {
    console.error('Unlike post error:', err);
    return { success: false, error: 'Erreur lors du retrait du like. Veuillez réessayer.' };
  }
}

// Retweet
export async function retweetPost(postId: number, comment?: string): Promise<{success: boolean, error?: string}> {
  try {
    const body: any = {};
    if (comment) {
      body.comment = comment;
    }

    const res = await fetch(`${API_BASE}/posts/${postId}/retweet`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return { success: true };
    } else {
      try {
        const data = await res.json();
        return { success: false, error: data.error || 'Erreur lors du retweet. Veuillez réessayer.' };
      } catch {
        return { success: false, error: 'Erreur lors du retweet. Veuillez réessayer.' };
      }
    }
  } catch (err) {
    console.error('Retweet error:', err);
    return { success: false, error: 'Erreur lors du retweet. Veuillez réessayer.' };
  }
}

export async function unretweetPost(postId: number): Promise<{success: boolean, error?: string}> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/retweet`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      return { success: true };
    } else {
      try {
        const data = await res.json();
        return { success: false, error: data.error || 'Erreur lors du retrait du retweet. Veuillez réessayer.' };
      } catch {
        return { success: false, error: 'Erreur lors du retrait du retweet. Veuillez réessayer.' };
      }
    }
  } catch (err) {
    console.error('Unretweet error:', err);
    return { success: false, error: 'Erreur lors du retrait du retweet. Veuillez réessayer.' };
  }
}

// Follow
export async function followUser(userId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.ok || res.status === 201;
  } catch (err) {
    console.error('Follow user error:', err);
    return false;
  }
}

export async function unfollowUser(userId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Unfollow user error:', err);
    return false;
  }
}

// Replies
export async function getReplies(postId: number): Promise<Reply[]> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/replies`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Fetch replies failed');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Get replies error:', err);
    return [];
  }
}

export async function createReply(postId: number, content: string): Promise<{reply: Reply | null, error?: string}> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/replies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      try {
        const error = await res.json();
        return { reply: null, error: error.error || 'Erreur lors de la création de la réponse. Veuillez réessayer.' };
      } catch {
        return { reply: null, error: 'Erreur lors de la création de la réponse. Veuillez réessayer.' };
      }
    }
    const reply = await res.json();
    return { reply };
  } catch (err) {
    console.error('Create reply error:', err);
    return { reply: null, error: 'Erreur lors de la création de la réponse. Veuillez réessayer.' };
  }
}

export async function deleteReply(replyId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/replies/${replyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Delete reply error:', err);
    return false;
  }
}

// Blocking functions
export async function blockUser(userId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/block`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Block user error:', err);
    return false;
  }
}

export async function unblockUser(userId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/block`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Unblock user error:', err);
    return false;
  }
}

export async function getBlockedUsers(userId: number): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/blocked-users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error('Get blocked users error:', err);
    return [];
  }
}

export async function isUserBlocked(userId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/is-blocked`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return false;
    }
    const data = await res.json();
    return data.isBlocked || false;
  } catch (err) {
    console.error('Check blocked user error:', err);
    return false;
  }
}

// Media upload
export async function uploadMedia(file: File): Promise<{mediaUrl?: string, error?: string}> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.error || 'Upload failed' };
    }

    const data = await res.json();
    // Retourner le chemin relatif (sans ajouter /api)
    return { mediaUrl: data.mediaUrl };
  } catch (err) {
    console.error('Upload media error:', err);
    return { error: 'Erreur lors du téléchargement du fichier' };
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
  const token = localStorage.getItem('authToken');
  return token;
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

export async function pinPost(userId: number, postId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/pin-post/${postId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Pin post error:', err);
    return false;
  }
}

export async function unpinPost(userId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/pin-post`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Unpin post error:', err);
    return false;
  }
}

// Search
export interface SearchOptions {
  q: string;
  type?: 'all' | 'posts' | 'users';
  sort?: 'date' | 'relevance';
  startDate?: string;
  endDate?: string;
}

export interface SearchResult {
  posts: Post[];
  users: User[];
  query: string;
  postCount: number;
  userCount: number;
}

export async function searchContent(options: SearchOptions): Promise<SearchResult> {
  try {
    const params = new URLSearchParams();
    params.set('q', options.q);
    if (options.type) params.set('type', options.type);
    if (options.sort) params.set('sort', options.sort);
    if (options.startDate) params.set('startDate', options.startDate);
    if (options.endDate) params.set('endDate', options.endDate);

    const res = await fetch(`${API_BASE}/search?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Search failed');
    }

    const data = await res.json();
    
    // Normaliser les URLs des médias
    if (data.posts && Array.isArray(data.posts)) {
      data.posts = data.posts.map((post: Post) => ({
        ...post,
        mediaUrl: post.mediaUrl && !post.mediaUrl.startsWith('http')
          ? `${BACKEND_ORIGIN}${post.mediaUrl}`
          : post.mediaUrl,
      }));
    }

    return data as SearchResult;
  } catch (err) {
    console.error('Search error:', err);
    return {
      posts: [],
      users: [],
      query: options.q,
      postCount: 0,
      userCount: 0,
    };
  }
}

export function logout(): void {
  clearCurrentUser();
  clearAuthToken();
}
