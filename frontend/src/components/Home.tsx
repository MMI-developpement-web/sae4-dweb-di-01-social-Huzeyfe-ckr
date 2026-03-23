import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Post from './ui/Post'
import Footer from './ui/Footer'
import SideBar from './ui/SideBar'
import { getPosts, type Post as PostType } from "../lib/api";
import Header from "./ui/Header";
import Profile from "./ui/Profile";

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const data = await getPosts();
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(sorted);
      setLoading(false);
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, []);







  
  return (
    <div className="min-h-screen bg-bg-black text-text-white flex pb-16 md:pb-0">
      <SideBar />

      <main className="flex-1 md:ml-72 flex flex-col items-center w-full">

        
        <div className="w-full max-w-2xl border-r border-border-dark md:border-l md:border-border-dark">
        <Header/>
        <Profile/>


          {/* Posts Feed */}
          <div className="divide-y divide-border-dark pb-24 md:pb-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-text-muted">Chargement...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-text-muted">Aucun post pour le moment</p>
              </div>
            ) : (
              posts.map((p) => {
                const rawPp = p.user.pp;
                const avatar = rawPp && rawPp !== "null" ? rawPp : `https://picsum.photos/seed/${encodeURIComponent(p.user.user)}/200`;
                return (
                  <div 
                    key={p.id} 
                    className="hover:bg-surface-dark/20 transition cursor-pointer p-4 md:p-6"
                  >
                    <Post
                      name={p.user.name}
                      handle={`@${p.user.user}`}
                      avatar={avatar}
                      time={p.createdAt}
                      text={p.content}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>





      {/* ==================== MOBILE BOTTOM NAVIGATION ==================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Footer />
      </div>

      <button 
        onClick={() => navigate('/post')} 
        className="md:hidden fixed bottom-20 right-4 bg-tick hover:bg-tick/90 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-text-white font-bold text-2xl z-40 transition"
      >
        +
      </button>
    </div>
  );
}
