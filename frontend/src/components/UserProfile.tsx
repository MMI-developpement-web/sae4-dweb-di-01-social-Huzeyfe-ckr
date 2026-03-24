import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUser, followUser, unfollowUser, getCurrentUser, getPosts, type User, type Post as PostType } from "../lib/api";
import Header from "./ui/Header";
import SideBar from "./ui/SideBar";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Post from "./ui/Post";
import Footer from "./ui/Footer";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        const userData = await getUser(Number(id));
        setUser(userData);
        setIsFollowing(userData?.isFollowing || false);

        // Charger les posts de l'utilisateur
        const allPosts = await getPosts();
        const userPosts = allPosts
          .filter((post: PostType) => post.user.id === userData?.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(userPosts);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!user) return;
    setFollowLoading(true);
    
    try {
      if (isFollowing) {
        const success = await unfollowUser(user.id);
        if (success) {
          setIsFollowing(false);
          setUser(prev => prev ? { ...prev, followers: (prev.followers || 0) - 1 } : null);
        }
      } else {
        const success = await followUser(user.id);
        if (success) {
          setIsFollowing(true);
          setUser(prev => prev ? { ...prev, followers: (prev.followers || 0) + 1 } : null);
        }
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = () => {
    // Recharger les posts après suppression
    const loadUserPosts = async () => {
      const allPosts = await getPosts();
      const userPosts = allPosts
        .filter((post: PostType) => post.user.id === user?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(userPosts);
    };
    loadUserPosts();
  };

  const getAvatarUrl = () => {
    if (user?.pp && user.pp !== "null" && user.pp !== "" && user.pp !== null) {
      return user.pp;
    }
    return `https://picsum.photos/seed/${encodeURIComponent(user?.user || "default")}/200`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-black flex items-center justify-center">
        <p className="text-text-white">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-white mb-4">Utilisateur non trouvé</p>
          <Button onClick={() => navigate("/home")}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="bg-bg-black min-h-screen text-text-white flex flex-col md:flex-row">
      <SideBar />
      <Header showLogout={true} />

      <main className="flex-1 md:ml-72 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl border-r border-border-dark md:border-l md:border-border-dark pb-24 md:pb-0">
          
          {/* Bannière */}
          <div className="h-32 md:h-48 bg-linear-to-r from-tick to-text-muted"></div>

          {/* Info utilisateur */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            {/* Avatar */}
            <div className="-mt-16 md:-mt-20 mb-4">
              <Avatar size="lg" src={getAvatarUrl()} alt={user?.name || "User"}>
                <div className="text-xl md:text-2xl font-bold">{user?.name?.charAt(0) || "U"}</div>
              </Avatar>
            </div>

            {/* Profil Header avec nom et bouton */}
            <div className="flex justify-between items-center gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold truncate">{user?.name}</h1>
                <p className="text-text-muted text-xs md:text-sm">@{user?.user || user?.username}</p>
              </div>

              {/* Follow/Unfollow Button */}
              {!isOwnProfile && (
                <Button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  variant={isFollowing ? "dark" : "solid"}
                  size="sm"
                  className={isFollowing ? "" : "bg-tick hover:bg-tick/90 shrink-0"}
                >
                  {followLoading
                    ? "..."
                    : isFollowing
                    ? "Ne plus suivre"
                    : "Suivre"}
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 md:gap-6 border-t border-b border-border-dark py-3 mb-4">
              <div>
                <span className="font-bold text-sm md:text-base">{posts.length}</span>
                <p className="text-text-muted text-xs md:text-sm">Tweets</p>
              </div>
              <div>
                <span className="font-bold text-sm md:text-base">{user?.followers || 0}</span>
                <p className="text-text-muted text-xs md:text-sm">Abonnés</p>
              </div>
              <div>
                <span className="font-bold text-sm md:text-base">{user?.following || 0}</span>
                <p className="text-text-muted text-xs md:text-sm">Abonnements</p>
              </div>
            </div>

            {/* Texte informations */}
            <div className="text-xs md:text-sm text-text-muted space-y-2">
              {user?.email && <p>📧 {user.email}</p>}
              {user?.createdAt && <p>Inscrit depuis le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</p>}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border-dark"></div>

          {/* Posts de l'utilisateur */}
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
                      onDelete={handlePostDeleted}
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
