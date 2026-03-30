import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import Post from './ui/Post'
import Footer from './ui/Footer'
import SideBar from './ui/SideBar'
import { getPosts, getCurrentUser, getAuthToken, searchContent, type Post as PostType } from "../lib/api";
import Header from "./ui/Header";
import Profile from "./ui/Profile";
import { debounce } from "../lib/utils";
import Avatar from "./ui/Avatar";

export default function Home() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const authToken = getAuthToken();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ posts: PostType[]; users: any[] }>({ posts: [], users: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'following'>('all');
  const postsRef = useRef<PostType[]>([]);

  // Check if user is authenticated - BOTH currentUser AND authToken must exist
  if (!currentUser || !authToken) {
    navigate('/login');
    return (
      <div className="min-h-screen bg-bg-black flex items-center justify-center">
        <p className="text-text-white">Redirection vers la connexion...</p>
      </div>
    );
  }

  // Fonction de recherche débounced
  const performSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setSearchResults({ posts: [], users: [] });
        setSearchLoading(false);
        return;
      }

      try {
        setSearchLoading(true);
        const results = await searchContent({
          q,
          type: 'all',
          sort: 'date',
        });
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({ posts: [], users: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    []
  );

  // Mettre à jour la recherche quand la query change
  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  // Charger les posts au démarrage
  useEffect(() => {
    const loadInitialPosts = async () => {
      setLoading(true);
      const filterParam = filter === 'following' ? 'following' : undefined;
      const data = await getPosts(filterParam);
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(sorted);
      postsRef.current = sorted;
      setLoading(false);
    };

    loadInitialPosts();
  }, [filter]);




  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(async () => {
      const filterParam = filter === 'following' ? 'following' : undefined;
      const data = await getPosts(filterParam);
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Comparer les nouveaux posts avec les anciens
      if (sorted.length > postsRef.current.length) {
        const newCount = sorted.length - postsRef.current.length;
        setNewPostsCount(newCount);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [filter]);

  const handlePostDeleted = (deletedPostId: number) => {
    const filtered = posts.filter(p => p.id !== deletedPostId);
    setPosts(filtered);
    postsRef.current = filtered;
  };



  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const filterParam = filter === 'following' ? 'following' : undefined;
      const data = await getPosts(filterParam);
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(sorted);
      postsRef.current = sorted;
      setNewPostsCount(0);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    } finally {
      setRefreshing(false);
    }
  };







  
  return (
    <div className="min-h-screen bg-bg-black text-text-white flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <SideBar />

      {/* Header Mobile */}
      <Header showLogout={true} />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl border-r border-border-dark md:border-l md:border-border-dark">
          {/* Profile Card */}
          <div className="bg-black px-4 py-4 md:px-6 md:py-6 border-b border-border-dark hover:bg-surface-dark/20 transition">
            <Profile />
          </div>

          {/* Search Bar */}
          <div className="sticky top-0 z-20 bg-bg-black/95 backdrop-blur-sm border-b border-border-dark px-4 md:px-6 py-3">
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Chercher des posts ou des utilisateurs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 text-text-white placeholder-text-muted rounded-full py-2 px-4 border border-border-dark focus:border-tick focus:outline-none transition"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full font-semibold text-sm whitespace-nowrap transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Search Results Section */}
          {searchQuery && (
            <div className="border-b border-border-dark">
              {searchLoading && (
                <div className="p-4 text-center text-text-muted">
                  <div className="inline-block animate-spin">
                    <div className="w-4 h-4 border-2 border-text-muted border-t-tick rounded-full"></div>
                  </div>
                  <p className="mt-2 text-sm">Recherche en cours...</p>
                </div>
              )}

              {!searchLoading && searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                <div className="p-4 text-center text-text-muted">
                  <p className="text-sm">Aucun résultat trouvé pour "{searchQuery}"</p>
                </div>
              )}

              {/* Users Results */}
              {searchResults.users.length > 0 && (
                <div className="border-b border-border-dark">
                  <div className="px-4 md:px-6 py-3 border-b border-border-dark">
                    <p className="text-sm font-bold text-text-muted">Utilisateurs ({searchResults.users.length})</p>
                  </div>
                  <div className="divide-y divide-border-dark">
                    {searchResults.users.map((user: any) => (
                      <div
                        key={user.id}
                        onClick={() => navigate(`/profile/${user.id}`)}
                        className="p-4 md:px-6 hover:bg-surface-dark/20 cursor-pointer transition flex items-center gap-3"
                      >
                        <Avatar 
                          src={user.pp && user.pp !== "null" && user.pp !== "" ? user.pp : `https://picsum.photos/seed/${encodeURIComponent(user.user || "default")}/200`}
                          alt={user.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white truncate">{user.name}</p>
                            {user.readOnly && (
                              <span className="text-xs bg-neutral-700 text-neutral-200 px-2 py-1 rounded">
                                🔒 Lecture
                              </span>
                            )}
                          </div>
                          <p className="text-text-muted text-sm">@{user.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {searchResults.posts.length > 0 && (
                <div>
                  <div className="px-4 md:px-6 py-3">
                    <p className="text-sm font-bold text-text-muted">Posts ({searchResults.posts.length})</p>
                  </div>
                  <div className="space-y-1">
                    {searchResults.posts.map((post: PostType) => (
                      <Post
                        key={post.id}
                        id={post.id}
                        name={post.user.name}
                        handle={`@${post.user.user}`}
                        avatar={post.user.pp && post.user.pp !== "null" && post.user.pp !== "" ? post.user.pp : `https://picsum.photos/seed/${encodeURIComponent(post.user.user || "default")}/200`}
                        time={post.createdAt}
                        text={post.content}
                        image={post.mediaUrl}
                        userId={post.user.id}
                        currentUserId={currentUser?.id}
                        likes={post.likes || 0}
                        liked={post.liked || false}
                        retweets={post.retweets || 0}
                        retweeted={post.retweeted || false}
                        userBlocked={post.user.blocked || false}
                        userReadOnly={post.user.readOnly || false}
                        censored={post.censored || false}
                        onDelete={() => {
                          performSearch(searchQuery);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter and Refresh Section - Hidden when searching */}
          {!searchQuery && (
          <div className="sticky top-[60px] z-10 bg-bg-black border-b border-border-dark">
            {/* Tabs */}
            <div className="flex">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-4 px-4 text-center font-bold transition border-b-2 text-sm md:text-base ${
                  filter === 'all'
                    ? 'text-tick border-tick'
                    : 'text-text-muted border-transparent hover:bg-surface-dark/20'
                }`}
              >
                Pour toi
              </button>
              <button
                onClick={() => setFilter('following')}
                className={`flex-1 py-4 px-4 text-center font-bold transition border-b-2 text-sm md:text-base ${
                  filter === 'following'
                    ? 'text-tick border-tick'
                    : 'text-text-muted border-transparent hover:bg-surface-dark/20'
                }`}
              >
                Abonnements
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full py-3 px-4 text-tick font-bold text-center text-sm md:text-base hover:bg-surface-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? 'Chargement...' : (
                newPostsCount > 0 
                  ? `SHOW ${newPostsCount} ${newPostsCount === 1 ? 'TWEET' : 'TWEETS'}`
                  : 'Rafraîchir la fil d\'actualité'
              )}
            </button>
          </div>
          )}

          {/* Posts Feed */}
          {!searchQuery && (
          <div className="divide-y divide-border-dark pb-24 md:pb-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 px-4">
                <p className="text-text-muted">Chargement...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex items-center justify-center py-16 px-4">
                <p className="text-text-muted">Aucun post pour le moment</p>
              </div>
            ) : (
              posts.map((p) => {
                const rawPp = p.user.pp;
                const avatar = rawPp && rawPp !== "null" ? rawPp : `https://picsum.photos/seed/${encodeURIComponent(p.user.user)}/200`;
                return (
                  <div 
                    key={p.id} 
                    className="px-4 py-4 md:px-6 md:py-4 hover:bg-surface-dark/20 transition cursor-pointer"
                  >
                    <Post
                      id={p.id}
                      name={p.user.name}
                      handle={`@${p.user.user}`}
                      avatar={avatar}
                      time={p.createdAt}
                      text={p.content}
                      image={p.mediaUrl}
                      userId={p.user.id}
                      currentUserId={currentUser?.id}
                      likes={p.likes || 0}
                      liked={p.liked || false}
                      retweets={p.retweets || 0}
                      retweeted={p.retweeted || false}
                      userBlocked={p.user.blocked || false}
                      censored={p.censored || false}
                      onDelete={() => handlePostDeleted(p.id)}
                      onLikeChange={(liked, likeCount) => {
                        const updatedPosts = posts.map(post =>
                          post.id === p.id ? { ...post, likes: likeCount, liked } : post
                        );
                        setPosts(updatedPosts);
                        postsRef.current = updatedPosts;
                      }}
                      onRetweetChange={(retweeted, retweetCount) => {
                        const updatedPosts = posts.map(post =>
                          post.id === p.id ? { ...post, retweets: retweetCount, retweeted } : post
                        );
                        setPosts(updatedPosts);
                        postsRef.current = updatedPosts;
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
          )}
        </div>
      </main>

      {/* ==================== MOBILE BOTTOM NAVIGATION & FAB ==================== */}
      {/* Footer Mobile */}
      <Footer className="md:hidden z-50" />

      {/* FAB - Create Post Button */}
      <button 
        onClick={() => navigate('/post')} 
        className="md:hidden fixed bottom-24 right-4 bg-tick hover:bg-tick/90 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-text-white font-bold text-2xl z-40 transition active:scale-95"
        title="Créer un nouveau post"
      >
        +
      </button>
    </div>
  );
}

