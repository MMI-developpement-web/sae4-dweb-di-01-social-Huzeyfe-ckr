import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUser, followUser, unfollowUser, getCurrentUser, getPosts, isUserBlocked, pinPost, unpinPost, type User, type Post as PostType } from "../lib/api";
import Header from "./ui/Header";
import SideBar from "./ui/SideBar";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Post from "./ui/Post";
import Footer from "./ui/Footer";
import EditUserProfile from "./ui/EditUserProfile";
import BlockButton from "./ui/BlockButton";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [pinnedPost, setPinnedPost] = useState<PostType | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        const userData = await getUser(Number(id));
        setUser(userData);
        setIsFollowing(userData?.isFollowing || false);

        // Charger l'état de blocage
        const blocked = await isUserBlocked(Number(id));
        setIsBlocked(blocked);

        // Charger les posts de l'utilisateur
        const allPosts = await getPosts();
        const userPosts = allPosts
          .filter((post: PostType) => post.user.id === userData?.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Séparer le post épinglé des autres posts
        if (userData?.pinnedPostId) {
          const pinned = userPosts.find(p => p.id === userData.pinnedPostId);
          if (pinned) {
            setPinnedPost(pinned);
            setPosts(userPosts.filter(p => p.id !== userData.pinnedPostId));
          } else {
            setPosts(userPosts);
          }
        } else {
          setPosts(userPosts);
        }
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

  const handlePinPost = async (postId: number) => {
    if (!currentUser || !user) return;

    // Si le post est déjà épinglé, le désépingler
    if (pinnedPost?.id === postId) {
      const success = await unpinPost(currentUser.id);
      if (success) {
        // Re-ajouter le post à la liste
        setPosts(prev => [...prev, pinnedPost].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        setPinnedPost(null);
      }
    } else {
      // Épingler le post
      const success = await pinPost(currentUser.id, postId);
      if (success) {
        // Trouver le post à épingler et le mettre à part
        const postToPin = posts.find(p => p.id === postId);
        if (postToPin) {
          // Désépingler ancien si existe
          if (pinnedPost) {
            setPosts(prev => [...prev, pinnedPost]);
          }
          setPinnedPost(postToPin);
          setPosts(prev => prev.filter(p => p.id !== postId));
        }
      }
    }
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

  if (isEditing) {
    return (
      <EditUserProfile
        user={user}
        onCancel={() => setIsEditing(false)}
        onSave={(updatedUser) => {
          setUser(updatedUser);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <div className="bg-bg-black min-h-screen text-text-white flex flex-col md:flex-row">
      <SideBar />
      <Header showLogout={true} />

      <main className="flex-1 md:ml-72 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl border-r border-border-dark md:border-l md:border-border-dark pb-24 md:pb-0">
          
          {/* Bannière */}
          <div 
            className="h-32 md:h-48 bg-linear-to-r from-tick to-text-muted bg-cover bg-center"
            style={user?.banner ? { backgroundImage: `url(${user.banner})`, backgroundSize: 'cover' } : {}}
          ></div>

          {/* Info utilisateur */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            {/* Avatar */}
            <div className="-mt-16 md:-mt-20 mb-4">
              <div className={user?.blocked ? 'grayscale opacity-95' : ''}>
                <Avatar size="lg" src={getAvatarUrl()} alt={user?.name || "User"}>
                  <div className="text-xl md:text-2xl font-bold">{user?.name?.charAt(0) || "U"}</div>
                </Avatar>
              </div>
            </div>

            {/* Profil Header avec nom et bouton */}
            <div className="flex justify-between items-center gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold truncate">
                    {user?.blocked ? "Utilisateur banni" : user?.name}
                  </h1>
                  {user?.readOnly && (
                    <span className="text-lg">🔒</span>
                  )}
                </div>
                <p className="text-text-muted text-xs md:text-sm">
                  {user?.blocked ? "" : `@${user?.user || user?.username}`}
                </p>
                {user?.readOnly && (
                  <p className="text-text-muted text-xs mt-1">Mode lecture seule</p>
                )}
              </div>

              {/* Follow/Unfollow or Edit Button */}
              {isOwnProfile ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  className="bg-tick hover:bg-tick/90 shrink-0"
                >
                  Éditer le profil
                </Button>
              ) : (
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={handleFollowToggle}
                    disabled={followLoading || user?.blocked}
                    variant={isFollowing ? "dark" : "solid"}
                    size="sm"
                    className={isFollowing ? "" : "bg-tick hover:bg-tick/90"}
                  >
                    {followLoading
                      ? "..."
                      : isFollowing
                      ? "Ne plus suivre"
                      : "Suivre"}
                  </Button>
                  <BlockButton 
                    userId={user?.id || 0}
                    isBlocked={isBlocked}
                    onBlockChange={setIsBlocked}
                  />
                </div>
              )}
            </div>

            {/* Bannissement Warning */}
            {user?.blocked && (
              <div className="bg-red-900/30  rounded-lg p-3 md:p-4 mb-4">
                <p className="text-red-400 font-semibold text-sm md:text-base flex items-center gap-2">
                  ⛔ Compte banni
                </p>
                <p className="text-red-300 text-xs md:text-sm mt-1">
                  Cet utilisateur a été suspendu pour non respect des conditions d'utilisation.
                </p>
              </div>
            )}

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
              {user?.bio && (
                <p className="text-text-white text-sm md:text-base mb-3">{user.bio}</p>
              )}
              {user?.location && <p>📍 {user.location}</p>}
              {user?.website && (
                <p>
                  🔗{" "}
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tick hover:underline"
                  >
                    {user.website}
                  </a>
                </p>
              )}
              {user?.email && <p>📧 {user.email}</p>}
              {user?.createdAt && <p>Inscrit depuis le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</p>}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border-dark"></div>

          {/* Post épinglé */}
          {pinnedPost && isOwnProfile && (
            <div className="bg-surface-dark/50 border-b border-border-dark">
              <div className="px-4 md:px-6 py-2 text-xs text-text-muted flex items-center gap-2">
                <span>📌</span>
                <span>Tweet épinglé</span>
              </div>
              <div className="px-4 md:px-6 py-4 hover:bg-surface-dark transition border-b border-border-dark">
                <Post
                  id={pinnedPost.id}
                  name={pinnedPost.user.name}
                  handle={`@${pinnedPost.user.user}`}
                  avatar={pinnedPost.user.pp && pinnedPost.user.pp !== "null" 
                    ? pinnedPost.user.pp 
                    : `https://picsum.photos/seed/${encodeURIComponent(pinnedPost.user.user)}/200`}
                  time={pinnedPost.createdAt}
                  text={pinnedPost.content}
                  image={pinnedPost.mediaUrl}
                  userId={pinnedPost.user.id}
                  currentUserId={currentUser?.id}
                  likes={pinnedPost.likes || 0}
                  liked={pinnedPost.liked || false}
                  userBlocked={pinnedPost.user.blocked || false}
                  censored={pinnedPost.censored || false}
                  onDelete={handlePostDeleted}
                  onPin={handlePinPost}
                  isPinned={true}
                  onLikeChange={(liked, likeCount) => {
                    setPinnedPost(prev => prev ? { ...prev, likes: likeCount, liked } : null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Posts de l'utilisateur */}
          <div className="divide-y divide-border-dark">
            {posts.length === 0 && !pinnedPost ? (
              <div className="px-4 md:px-6 py-10 text-center text-text-muted">
                <p>Aucun tweet pour le moment</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="px-4 md:px-6 py-10 text-center text-text-muted">
                <p>Aucun autre tweet</p>
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
                      image={post.mediaUrl}
                      userId={post.user.id}
                      currentUserId={currentUser?.id}
                      likes={post.likes || 0}
                      liked={post.liked || false}
                      userBlocked={post.user.blocked || false}
                      censored={post.censored || false}
                      onDelete={handlePostDeleted}
                      onPin={isOwnProfile ? handlePinPost : undefined}
                      isPinned={false}
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
