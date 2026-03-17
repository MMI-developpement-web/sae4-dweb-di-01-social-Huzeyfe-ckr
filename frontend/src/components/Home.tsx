import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from './ui/Footer'
import Post from './ui/Post'
import Header from './ui/Header'
import { getPosts, type Post as PostType } from "../lib/api";
import Profile from "./ui/Profile";

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const data = await getPosts();
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(sorted);
      setLoading(false);
    };

    fetchPosts();
    // Rafraîchir les posts toutes les 30 secondes
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg-black text-text-white pb-24">
      <Header />
      <Profile />

      <div className="max-w-md mx-auto px-4 pt-4">
        {loading ? (
          <p className="text-center text-text-muted py-8">Chargement...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-text-muted py-8">Aucun post pour le moment</p>
        ) : (
          posts.map((p) => {
            const rawPp = p.user.pp;
            const avatar = rawPp && rawPp !== "null" ? rawPp : `https://picsum.photos/seed/${encodeURIComponent(p.user.user)}/200`;
            return (
              <Post
                key={p.id}
                name={p.user.name}
                handle={`@${p.user.user}`}
                avatar={avatar}
                time={p.createdAt}
                text={p.content}
              />
            );
          })
        )}
      </div>

      {/* Floating action button */}
      <button onClick={() => navigate('/post')} className="fixed bottom-20 right-6 bg-tick w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-text-white">+</button>

      {/* Footer (replaces bottom nav) */}
      <Footer />
    </div>
  );
}
