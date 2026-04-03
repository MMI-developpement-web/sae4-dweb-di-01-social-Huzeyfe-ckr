/**
 * StoreContext
 * Implémentation du Store Pattern avec React Context
 * 
 * Architecture:
 * - StoreProvider: enveloppe l'application (remplace le manuel state management)
 * - useStore(): hook qui accède au Store (partout dans l'app, sans prop drilling)
 * 
 * Parallèle MVC:
 * - State (useState): le Modèle
 * - Actions (fonctions): le Contrôleur
 * - React re-render automatique: le notifyAll() de MVC
 */

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppState, StoreContextType, User, Post, Reply } from './types';
import { saveCurrentUser, clearCurrentUser, getCurrentUser as getStoredUser } from '../lib/api';

// ─── CRÉATION DU CONTEXTE ───────────────────────────────────────────────────

const StoreContext = createContext<StoreContextType | null>(null);

// ─── ÉTAT INITIAL ──────────────────────────────────────────────────────────

const initialState: AppState = {
  currentUser: getStoredUser(), // Récupère depuis localStorage
  isAuthenticated: !!getStoredUser(),
  authToken: localStorage.getItem('authToken'),
  posts: [],
  isLoadingPosts: false,
  replies: {},
};

// ─── PROVIDER ──────────────────────────────────────────────────────────────
/**
 * StoreProvider
 * C'est le composant qui "enveloppe" l'application et fournit le contexte à tous les enfants.
 * C'est ici que vit TOUT l'état global de l'application.
 */

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // État principal
  const [currentUser, setCurrentUserState] = useState<User | null>(initialState.currentUser);
  const [authToken, setAuthToken] = useState<string | null>(initialState.authToken);
  const [posts, setPostsState] = useState<Post[]>(initialState.posts);
  const [isLoadingPosts, setLoadingPostsState] = useState(false);
  const [replies, setRepliesState] = useState<Record<number, Reply[]>>({});

  // ─── ACTIONS D'AUTHENTIFICATION ─────────────────────────────────────────

  /**
   * login(user, token)
   * Appelé après que l'utilisateur se connecte
   * Stocke l'utilisateur et le token, met à jour l'état
   */
  const login = (user: User, token: string): void => {
    setCurrentUserState(user);
    setAuthToken(token);
    saveCurrentUser(user);
    localStorage.setItem('authToken', token);
  };

  /**
   * logout()
   * Appelé quand l'utilisateur se déconnecte
   * Nettoie tout l'état et le localStorage
   */
  const logout = (): void => {
    setCurrentUserState(null);
    setAuthToken(null);
    setPostsState([]);
    setRepliesState({});
    clearCurrentUser();
    localStorage.removeItem('authToken');
  };

  /**
   * setCurrentUser(user)
   * Expose un setter simple pour mettre à jour l'utilisateur courant
   */
  const setCurrentUser = (user: User): void => {
    setCurrentUserState(user);
    saveCurrentUser(user);
  };

  /**
   * updateCurrentUser(partialUser)
   * Met à jour partiellement l'utilisateur courant (ex: profile update)
   */
  const updateCurrentUser = (partialUser: Partial<User>): void => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...partialUser };
    setCurrentUser(updatedUser);
  };

  // ─── ACTIONS DE POSTS ──────────────────────────────────────────────────

  /**
   * setPosts(posts)
   * Remplace toute la liste de posts (ex: après fetch de la page Home)
   */
  const setPosts = (newPosts: Post[]): void => {
    setPostsState(newPosts);
  };

  /**
   * addPost(post)
   * Ajoute un nouveau post au début de la liste (comme en MVC: Model.addPost)
   */
  const addPost = (post: Post): void => {
    setPostsState((prev) => [post, ...prev]);
  };

  /**
   * updatePost(postId, updatedPost)
   * Met à jour un post existant (ex: après avoir liké, supprimé, censuré)
   */
  const updatePost = (postId: number, updatedPost: Partial<Post>): void => {
    setPostsState((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, ...updatedPost } : post
      )
    );
  };

  /**
   * deletePost(postId)
   * Supprime un post de la liste
   */
  const deletePost = (postId: number): void => {
    setPostsState((prev) => prev.filter((post) => post.id !== postId));
  };

  /**
   * setLoadingPosts(loading)
   * Indique si on est en train de charger les posts
   * (Détail : Suspense peut remplacer ça à terme, mais c'est une approche valide)
   */
  const setLoadingPosts = (loading: boolean): void => {
    setLoadingPostsState(loading);
  };

  // ─── ACTIONS DE REPLIES ────────────────────────────────────────────────

  /**
   * setReplies(postId, replies)
   * Remplace les replies d'un post spécifique
   */
  const setReplies = (postId: number, newReplies: Reply[]): void => {
    setRepliesState((prev) => ({
      ...prev,
      [postId]: newReplies,
    }));
  };

  /**
   * addReply(postId, reply)
   * Ajoute une nouvelle reply à un post
   */
  const addReply = (postId: number, reply: Reply): void => {
    setRepliesState((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), reply],
    }));
  };

  /**
   * deleteReply(postId, replyId)
   * Supprime une reply d'un post
   */
  const deleteReply = (postId: number, replyId: number): void => {
    setRepliesState((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((reply) => reply.id !== replyId),
    }));
  };

  // ─── CONSTRUCTION DU CONTEXTE ──────────────────────────────────────────
  /**
   * On groupé l'état et les actions dans un seul objet
   * C'est ce qui sera passé via <StoreContext.Provider value={{ ... }}>
   */
  const value: StoreContextType = {
    // État
    currentUser,
    isAuthenticated: !!currentUser,
    authToken,
    posts,
    isLoadingPosts,
    replies,
    // Actions
    login,
    logout,
    setCurrentUser,
    updateCurrentUser,
    setPosts,
    addPost,
    updatePost,
    deletePost,
    setLoadingPosts,
    setReplies,
    addReply,
    deleteReply,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

// ─── HOOK D'ACCÈS AU STORE ────────────────────────────────────────────────
/**
 * useStore()
 * Hook qui permet à n'importe quel composant d'accéder au Store
 * Remplace le besoin de faire descendre les props à travers l'arbre.
 * 
 * Utilisation :
 *   const { currentUser, posts, addPost, logout } = useStore();
 *
 * C'est l'équivalent React du pattern MVC:
 * - En jQuery vanilla MVC, tu appelleras Model.save() ou Controller.logout()
 * - En React avec Store, tu appelles useStore().logout()
 */
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  
  if (!context) {
    throw new Error(
      "useStore() doit être utilisé à l'intérieur d'un <StoreProvider>. " +
      "Assurez-vous que StoreProvider enveloppe votre application."
    );
  }
  
  return context;
};
