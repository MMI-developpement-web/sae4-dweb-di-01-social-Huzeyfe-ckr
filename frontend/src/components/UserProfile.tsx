import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUser, followUser, unfollowUser, getPosts, isUserBlocked, getMediaUrl, type User, type Post as PostType } from "../lib/api";
import { useStore } from "../store/StoreContext";
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
  const { currentUser } = useStore();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userId = id ? Number(id) : undefined;
      if (!userId || isNaN(userId)) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getUser(userId);
        setUser(userData);
        setIsFollowing(userData?.isFollowing || false);

        // Charger l'état de blocage
        const blocked = await isUserBlocked(userId);
        setIsBlocked(blocked);

        // Charger les posts de l'utilisateur
        const allPosts = await getPosts();
        const userPosts = allPosts
          .filter((post: PostType) => post.user.id === userData?.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Séparer les posts épingles des autres posts
        if (userData?.pinnedPostIds && userData.pinnedPostIds.length > 0) {
          const pinned = userPosts.filter(p => userData.pinnedPostIds?.includes(p.id));
          const unpinned = userPosts.filter(p => !userData.pinnedPostIds?.includes(p.id));
          setPinnedPosts(pinned);
          setPosts(unpinned);
        } else {
          setPinnedPosts([]);
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

  const getAvatarUrl = () => {
    if (user?.pp && user.pp !== "null" && user.pp !== "" && user.pp !== null) {
      return getMediaUrl(user.pp);
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
            style={user?.banner ? { backgroundImage: `url(${getMediaUrl(user.banner)})`, backgroundSize: 'cover' } : {}}
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
              <aside 
                className="rounded-lg p-3 md:p-4 mb-4 border-l-4"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-error) 10%, var(--color-bg-black) 90%)',
                  borderLeftColor: 'var(--color-error)',
                  color: 'var(--color-error)'
                }}
                role="alert"
                aria-label="Avertissement compte banni"
              >
                <p className="font-semibold text-sm md:text-base flex items-center gap-2">
                  ⛔ Compte banni
                </p>
                <p 
                  className="text-xs md:text-sm mt-1 opacity-90"
                  style={{ color: 'var(--color-error)' }}
                >
                  Cet utilisateur a été suspendu pour non respect des conditions d'utilisation.
                </p>
              </aside>
            )}

            {/* Stats */}
            <dl className="flex gap-4 md:gap-6 border-t border-b border-border-dark py-3 mb-4">
              <div>
                <dt className="text-text-muted text-xs md:text-sm">Tweets</dt>
                <dd className="font-bold text-sm md:text-base">{posts.length}</dd>
              </div>
              <div>
                <dt className="text-text-muted text-xs md:text-sm">Abonnés</dt>
                <dd className="font-bold text-sm md:text-base">{user?.followers || 0}</dd>
              </div>
              <div>
                <dt className="text-text-muted text-xs md:text-sm">Abonnements</dt>
                <dd className="font-bold text-sm md:text-base">{user?.following || 0}</dd>
              </div>
            </dl>

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

        
          {/* Posts de l'utilisateur (épingles en premier) */}
          <div className="divide-y divide-border-dark">
            {pinnedPosts.length === 0 && posts.length === 0 ? (
              <div className="px-4 md:px-6 py-10 text-center text-text-muted">
                <p>Aucun tweet pour le moment</p>
              </div>
            ) : (
              <>
                {/* Afficher d'abord les posts épingles */}
                {pinnedPosts.map((post) => {
                  const avatar = post.user.pp && post.user.pp !== "null" 
                    ? getMediaUrl(post.user.pp)
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
                        retweets={post.retweets || 0}
                        retweeted={post.retweeted || false}
                        userBlocked={post.user.blocked || false}
                        userReadOnly={post.user.readOnly || false}
                        censored={post.censored || false}
                        isPinned={user?.pinnedPostIds?.includes(post.id) || false}                      retweetedFromPost={post.retweetedFrom}                        onDelete={handlePostDeleted}
                        onLikeChange={(liked, likeCount) => {
                          const updatedPosts = pinnedPosts.map(p =>
                            p.id === post.id ? { ...p, likes: likeCount, liked } : p
                          );
                          setPinnedPosts(updatedPosts);
                        }}
                        onRetweetChange={(retweeted, retweetCount) => {
                          const updatedPosts = pinnedPosts.map(p =>
                            p.id === post.id ? { ...p, retweets: retweetCount, retweeted } : p
                          );
                          setPinnedPosts(updatedPosts);
                        }}
                      />
                    </div>
                  );
                })}
                {/* Puis afficher les posts normaux */}
                {posts.map((post) => {
                  const avatar = post.user.pp && post.user.pp !== "null" 
                    ? getMediaUrl(post.user.pp)
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
                        retweets={post.retweets || 0}
                        retweeted={post.retweeted || false}
                        userBlocked={post.user.blocked || false}
                        userReadOnly={post.user.readOnly || false}
                        censored={post.censored || false}
                        isPinned={user?.pinnedPostIds?.includes(post.id) || false}
                        onDelete={handlePostDeleted}
                        onLikeChange={(liked, likeCount) => {
                          const updatedPosts = posts.map(p =>
                            p.id === post.id ? { ...p, likes: likeCount, liked } : p
                          );
                          setPosts(updatedPosts);
                        }}
                        onRetweetChange={(retweeted, retweetCount) => {
                          const updatedPosts = posts.map(p =>
                            p.id === post.id ? { ...p, retweets: retweetCount, retweeted } : p
                          );
                          setPosts(updatedPosts);
                        }}
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer Mobile */}
      <Footer className="md:hidden" />
    </div>
  );
}
