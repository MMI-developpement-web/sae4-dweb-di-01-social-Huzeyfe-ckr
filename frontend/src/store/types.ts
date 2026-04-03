/**
 * Store Types
 * Définition des interfaces pour l'état et les actions du Store
 * Parallèle avec le pattern MVC : User = State, les fonctions = Actions du Contrôleur
 */

export interface User {
  id: number;
  username?: string;
  user?: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  active: boolean;
  blocked?: boolean;
  readOnly?: boolean;
  pinnedPostIds?: number[];
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
  retweetedFrom?: Post;
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
  mediaUrl?: string;
  canDelete?: boolean;
  user: {
    id: number;
    username: string;
    displayName: string;
    pp?: string;
    blocked?: boolean;
  };
}

/**
 * État de l'application (Modèle en MVC)
 */
export interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
  posts: Post[];
  isLoadingPosts: boolean;
  replies: Record<number, Reply[]>; // postId -> replies
}

/**
 * Actions du Store (Contrôleur en MVC)
 * Ce sont les seules façons de modifier l'état
 */
export interface StoreActions {
  // Auth actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  updateCurrentUser: (user: Partial<User>) => void;

  // Posts actions
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: number, updatedPost: Partial<Post>) => void;
  deletePost: (postId: number) => void;
  setLoadingPosts: (loading: boolean) => void;

  // Replies actions
  setReplies: (postId: number, replies: Reply[]) => void;
  addReply: (postId: number, reply: Reply) => void;
  deleteReply: (postId: number, replyId: number) => void;
}

/**
 * Contexte complet = État + Actions
 * Équivalent du Contrôleur qui expose tout ce dont on a besoin
 */
export type StoreContextType = AppState & StoreActions;
