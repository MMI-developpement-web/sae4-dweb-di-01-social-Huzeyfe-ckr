import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Post from './ui/Post'
import Footer from './ui/Footer'
import SideBar from './ui/SideBar'
import { getPosts, getCurrentUser, getAuthToken, type Post as PostType } from "../lib/api";
import Header from "./ui/Header";
import Profile from "./ui/Profile";

export default function Home() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const authToken = getAuthToken();
  const [posts, setPosts] = useState<PostType[]>([]);
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

          {/* Filter and Refresh Section */}
          <div className="sticky top-0 z-10 bg-bg-black border-b border-border-dark">
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

          {/* Posts Feed */}
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

