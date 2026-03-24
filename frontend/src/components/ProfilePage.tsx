import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./ui/Header";
import SideBar from "./ui/SideBar";
import Footer from "./ui/Footer";
import Avatar from "./ui/Avatar";
import Post from "./ui/Post";
import { getCurrentUser, getUser, getPosts, type Post as PostType } from "../lib/api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [userData, setUserData] = useState(currentUser);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      const currentUser = getCurrentUser();
      
      if (!currentUser?.id) {
        navigate("/login");
        return;
      }

      try {
        // Charger les données utilisateur mises à jour
        const user = await getUser(currentUser.id);
        if (user) {
          setUserData(user);
        }

        // Charger les posts de l'utilisateur
        const allPosts = await getPosts();
        const userPosts = allPosts
          .filter((post: PostType) => post.user.id === currentUser.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(userPosts);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [navigate]);

  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentUser = getCurrentUser();
      
      if (!currentUser?.id) {
        return;
      }

      try {
        // Charger les données utilisateur mises à jour
        const user = await getUser(currentUser.id);
        if (user) {
          setUserData(user);
        }

        // Charger les posts de l'utilisateur
        const allPosts = await getPosts();
        const userPosts = allPosts
          .filter((post: PostType) => post.user.id === currentUser.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(userPosts);
      } catch (error) {
        console.error("Erreur lors du rafraîchissement du profil:", error);
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, []);

  const handlePostDeleted = (deletedPostId: number) => {
    setPosts(posts.filter(p => p.id !== deletedPostId));
  };

  const getAvatarUrl = () => {
    if (userData?.pp && userData.pp !== "null" && userData.pp !== "" && userData.pp !== null) {
      return userData.pp;
    }
    return `https://picsum.photos/seed/${encodeURIComponent(userData?.user || "default")}/200`;
  };

  if (loading) {
    return <div className="text-center py-10">Chargement...</div>;
  }

  return (
    <div className="bg-bg-black min-h-screen text-text-white flex flex-col md:flex-row">
      {/* Desktop: Sidebar */}
      <SideBar />

      {/* Header Mobile */}
      <Header showLogout={true} />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl border-r border-border-dark md:border-l md:border-border-dark pb-24 md:pb-0">
          
          {/* Bannière */}
          <div className="h-32 md:h-48 bg-linear-to-r from-tick to-text-muted"></div>

          {/* Info utilisateur */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            {/* Avatar et boutons */}
            <div className="flex justify-between items-start -mt-16 md:-mt-20 mb-4">
              <Avatar size="lg" src={getAvatarUrl()} alt={userData?.name || "User"}>
                <div className="text-xl md:text-2xl font-bold">{userData?.name?.charAt(0) || "U"}</div>
              </Avatar>
            </div>

            {/* Informations du profil */}
            <div className="mb-4">
              <h1 className="text-xl md:text-2xl font-bold">{userData?.name}</h1>
              <p className="text-text-muted text-xs md:text-sm">@{userData?.user}</p>
            </div>

            {/* Bio / Description */}
            <div className="text-sm md:text-base mb-4">
              <p>Mon bio ici</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 md:gap-6 border-t border-b border-border-dark py-3 mb-4">
              <div>
                <span className="font-bold text-sm md:text-base">{posts.length}</span>
                <p className="text-text-muted text-xs md:text-sm">Tweets</p>
              </div>
              <div>
                <span className="font-bold text-sm md:text-base">{userData?.followers || 0}</span>
                <p className="text-text-muted text-xs md:text-sm">Abonnés</p>
              </div>
              <div>
                <span className="font-bold text-sm md:text-base">{userData?.following || 0}</span>
                <p className="text-text-muted text-xs md:text-sm">Abonnements</p>
              </div>
            </div>

            {/* Texte informations */}
            <div className="text-xs md:text-sm text-text-muted space-y-2">
              <p>📧 {userData?.email}</p>
              <p>Inscrit depuis le {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("fr-FR") : "N/A"}</p>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border-dark"></div>

        
          <div className="divide-y divide-border-dark">
            {posts.length === 0 ? (
              <div className="px-4 md:px-6 py-10 text-center text-text-muted">
                <p>Aucun tweet pour le moment</p>
              </div>
            ) : (
              posts.map((post) => {
                const avatar = post.user.pp && post.user.pp !== "null" 
                  ? post.user.pp 
                  : `https://picsum.photos/seed/${encodeURIComponent(post.user.user)}/200`;
                return (
                  <div
                    key={post.id}
                    className="px-4 md:px-6 py-4 hover:bg-surface-dark transition"
                  >
                    <Post
                      id={post.id}
                      name={post.user.name}
                      handle={`@${post.user.user}`}
                      avatar={avatar}
                      time={post.createdAt}
                      text={post.content}
                      userId={post.user.id}
                      currentUserId={currentUser?.id}
                      likes={post.likes || 0}
                      liked={post.liked || false}
                      onDelete={() => handlePostDeleted(post.id)}
                      onLikeChange={(liked, likeCount) => {
                        const updatedPosts = posts.map(p =>
                          p.id === post.id ? { ...p, likes: likeCount, liked } : p
                        );
                        setPosts(updatedPosts);
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Footer Mobile */}
      <Footer className="md:hidden" />
    </div>
  );
}
