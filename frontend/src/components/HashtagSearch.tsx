import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./ui/Header";
import SideBar from "./ui/SideBar";
import Post from "./ui/Post";

interface PostData {
  id: number;
  content: string;
  time?: string;
  createdAt: string;
  mediaUrl?: string;
  user?: {
    id: number;
    name: string;
    user: string;
    pp?: string;
    blocked: boolean;
    readOnly?: boolean;
  };
  likes: number;
  liked: boolean;
  censored: boolean;
}

export default function HashtagSearch() {
  const { hashtag } = useParams<{ hashtag: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const fetchPostsByHashtag = async () => {
      if (!hashtag) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/hashtags/${hashtag}/posts`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des posts pour ce hashtag');
        }

        const data = await response.json();
        setPosts(data.posts || []);
        setPostCount(data.postCount || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchPostsByHashtag();
  }, [hashtag, navigate]);

  const handlePostDeleted = (deletedId: number) => {
    setPosts(posts.filter(p => p.id !== deletedId));
    setPostCount(Math.max(0, postCount - 1));
  };

  return (
    <div className="bg-bg-black min-h-screen text-text-white flex flex-col md:flex-row">
      <SideBar />
      <Header showLogout={true} />

      <main className="flex-1 md:ml-72 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl border-r border-border-dark md:border-l md:border-border-dark pb-24 md:pb-0">
          {/* Hashtag Header */}
          <div className="sticky top-0 bg-bg-black/80 backdrop-blur-sm border-b border-border-dark px-4 md:px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-white mb-1">#{hashtag}</h1>
                <p className="text-text-muted text-sm">
                  {postCount} {postCount === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-text-muted">Chargement...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="px-4 md:px-6 py-4 bg-red-900/20 border-b border-red-600/30">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* No Posts State */}
          {!loading && !error && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-text-muted">
              <p className="text-lg mb-2">Aucun post trouvé pour #{hashtag}</p>
              <p className="text-sm">Soyez le premier à publier avec ce hashtag!</p>
            </div>
          )}

          {/* Posts List */}
          {!loading && !error && posts.length > 0 && (
            <div className="divide-y divide-border-dark">
              {posts.map((post) => (
                <div key={post.id} className="px-4 md:px-6 py-4 hover:bg-surface-dark/50 transition cursor-pointer border-b border-border-dark">
                  <Post
                    id={post.id}
                    name={post.user?.name || 'Utilisateur'}
                    handle={post.user?.user || '@unknown'}
                    avatar={post.user?.pp}
                    time={post.time}
                    text={post.content}
                    image={post.mediaUrl}
                    userId={post.user?.id}
                    currentUserId={parseInt(localStorage.getItem('userId') || '0')}
                    likes={post.likes}
                    liked={post.liked}
                    userBlocked={post.user?.blocked || false}
                    userReadOnly={post.user?.readOnly || false}
                    censored={post.censored}
                    onDelete={() => handlePostDeleted(post.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
