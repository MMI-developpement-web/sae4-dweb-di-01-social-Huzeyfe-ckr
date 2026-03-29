
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { deletePost, likePost, unlikePost, getReplies, updatePost, type Reply as ReplyType } from "../../lib/api";
import { InteractiveText } from "../../lib/hashtagParser";
import { Reply } from "./Reply";
import { ReplyForm } from "./ReplyForm";

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateString;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mois`;
  const years = Math.floor(months / 12);
  return `${years}an${years > 1 ? 's' : ''}`;
}

export interface PostProps {
  id?: number | string;
  name: string;
  handle: string;
  avatar?: string;
  time?: string;
  text?: string;
  image?: string;
  userId?: number;
  currentUserId?: number;
  likes?: number;
  liked?: boolean;
  userBlocked?: boolean;
  userReadOnly?: boolean;
  censored?: boolean;
  isAdmin?: boolean;
  isPinned?: boolean;
  onDelete?: () => void;
  onCensored?: (censored: boolean) => void;
  onLikeChange?: (liked: boolean, likeCount: number) => void;
  onEdit?: (newContent: string) => void;
  onPin?: (postId: number) => void;
}

export default function Post({ id, name, handle, avatar, time, text, image, userId, currentUserId, likes: initialLikes = 0, liked: initialLiked = false, userBlocked = false, userReadOnly = false, censored = false, isAdmin = false, isPinned = false, onDelete, onCensored, onLikeChange, onEdit, onPin }: PostProps) {
  const navigate = useNavigate();
  const displayTime = formatRelativeTime(time);
  const handleStr = typeof handle === 'string' ? handle : String(handle);
  const initials = handleStr?.charAt(1)?.toUpperCase() ?? handleStr?.charAt(0)?.toUpperCase() ?? "U";
  
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [censoringPost, setCensoringPost] = useState(false);
  const [isCensored, setIsCensored] = useState(censored);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [likingLoading, setLikingLoading] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<ReplyType[]>([]);
  const [repliesCount, setRepliesCount] = useState(0);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedContent, setEditedContent] = useState(text || "");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isOwnPost = userId === currentUserId;

  // Load replies count on mount
  useEffect(() => {
    const loadRepliesCount = async () => {
      if (!id) return;
      try {
        const loadedReplies = await getReplies(Number(id));
        setRepliesCount(loadedReplies.length);
        setReplies(loadedReplies);
      } catch (error) {
        console.error("Error loading replies count:", error);
      }
    };
    
    loadRepliesCount();
  }, [id]);

  // Auto-clear like error after 5 seconds
  useEffect(() => {
    if (likeError) {
      const timer = setTimeout(() => {
        setLikeError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [likeError]);

  const loadReplies = async () => {
    if (!id) return;
    setLoadingReplies(true);
    try {
      const loadedReplies = await getReplies(Number(id));
      setReplies(loadedReplies);
      setRepliesCount(loadedReplies.length);
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleShowReplies = async () => {
    if (!showReplies && replies.length === 0 && !loadingReplies) {
      await loadReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleReplyCreated = (newReply: ReplyType) => {
    setReplies([newReply, ...replies]);
    setRepliesCount(repliesCount + 1);
    setShowReplyForm(false);
  };

  const handleReplyDeleted = (replyId: number) => {
    setReplies(replies.filter(r => r.id !== replyId));
    setRepliesCount(Math.max(0, repliesCount - 1));
  };

  const handleDeleteClick = async () => {
    setDeleting(true);
    try {
      const success = await deletePost(Number(id));
      if (success) {
        setConfirmDelete(false);
        setShowMenu(false);
        onDelete?.();
      } else {
        alert("Erreur lors de la suppression du tweet");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Erreur lors de la suppression du tweet");
    } finally {
      setDeleting(false);
    }
  };

  const handleLikeClick = async () => {
    if (!id) return;
    setLikingLoading(true);
    setLikeError(null);
    try {
      if (liked) {
        const result = await unlikePost(Number(id));
        if (result.success) {
          setLiked(false);
          const newCount = Math.max(0, likeCount - 1);
          setLikeCount(newCount);
          onLikeChange?.(false, newCount);
        } else {
          setLikeError(result.error || 'Erreur lors du retrait du like. Veuillez réessayer.');
        }
      } else {
        const result = await likePost(Number(id));
        if (result.success) {
          setLiked(true);
          const newCount = likeCount + 1;
          setLikeCount(newCount);
          onLikeChange?.(true, newCount);
        } else {
          setLikeError(result.error || 'Erreur lors du like. Veuillez réessayer.');
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setLikeError('Erreur lors du like. Veuillez réessayer.');
    } finally {
      setLikingLoading(false);
    }
  };

  const handleCensorPost = async () => {
    if (!id || !isAdmin) return;
    setCensoringPost(true);
    try {
      const method = isCensored ? 'DELETE' : 'POST';
      const res = await fetch(`/api/admin/posts/${id}/censor`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (res.ok) {
        setIsCensored(!isCensored);
        onCensored?.(!isCensored);
      }
    } catch (error) {
      console.error('Error censoring post:', error);
    } finally {
      setCensoringPost(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!id || !editedContent.trim()) {
      setEditError("Le contenu ne peut pas être vide");
      return;
    }

    setEditLoading(true);
    setEditError(null);
    
    try {
      const success = await updatePost(Number(id), editedContent.trim());
      if (success) {
        // Notify parent component of the edit
        onEdit?.(editedContent.trim());
        // Close modals
        setShowEditModal(false);
        setShowMenu(false);
        // Refresh page to show updated content
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        setEditError("Erreur lors de la modification du tweet");
      }
    } catch (error) {
      console.error("Error editing post:", error);
      setEditError("Une erreur est survenue lors de la modification");
    } finally {
      setEditLoading(false);
    }
  };



  return (
    <article className="w-full">
      <div className="flex items-start gap-2 md:gap-3">
        <button
          onClick={() => userId && navigate(`/profile/${userId}`)}
          className="hover:opacity-80 transition shrink-0"
          aria-label={`View ${name}'s profile`}
        >
          <div className={userBlocked ? "grayscale opacity-75" : ""}>
            <Avatar size="md" src={avatar} alt={`${name} avatar`}>
              <div className="flex items-center justify-center w-full h-full text-xs md:text-sm font-bold text-text-white">{initials}</div>
            </Avatar>
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-bold text-text-white text-sm md:text-base truncate">
                  {userBlocked ? "Utilisateur banni" : name}
                </span>
                <span className="text-text-muted text-xs md:text-sm shrink-0">
                  {userBlocked ? "" : handleStr}
                </span>
              </div>
              <span className="text-text-muted text-xs md:text-sm">{displayTime}</span>
            </div>

            <div className="flex items-center gap-1 md:gap-3 shrink-0">
              {/* Bouton Réponse - Masqué si user readOnly */}
              {!userReadOnly && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 transition text-text-muted hover:text-primary text-xs md:text-sm"
                  aria-label="Répondre"
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="md:w-4 md:h-4"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span className="text-xs md:text-sm">{repliesCount}</span>
                </button>
              )}
              {userReadOnly && (
                <span className="flex items-center gap-1 text-text-muted text-xs md:text-sm">
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="md:w-4 md:h-4 opacity-50"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span className="text-xs md:text-sm opacity-50">{repliesCount}</span>
                </span>
              )}

              {/* Like Button - Cœur à droite */}
              <button
                onClick={handleLikeClick}
                disabled={likingLoading}
                className={`flex items-center gap-1 transition disabled:opacity-50 text-xs md:text-sm ${
                  liked 
                    ? 'text-error hover:text-error/90' 
                    : 'text-text-muted hover:text-error'
                }`}
                aria-label={liked ? "Unlike" : "Like"}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="md:w-4 md:h-4"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-xs md:text-sm">{likeCount}</span>
              </button>

              {/* Menu Button - 3 dots en horizontales */}
              {isOwnPost && (
                <>
                  {/* Pin Button */}
                  {onPin && (
                    <button
                      onClick={() => onPin(Number(id))}
                      className={`transition p-1.5 md:p-2 rounded-full ${
                        isPinned 
                          ? 'text-tick hover:bg-tick/10' 
                          : 'text-text-muted hover:text-tick hover:bg-tick/10'
                      }`}
                      aria-label={isPinned ? "Désépingler" : "Épingler"}
                      title={isPinned ? "Désépingler ce tweet" : "Épingler ce tweet"}
                    >
                      <span className="text-lg">📌</span>
                    </button>
                  )}
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="text-text-muted hover:text-tick transition p-1.5 md:p-2 rounded-full hover:bg-tick/10"
                      aria-label="Options du tweet"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="md:w-4 md:h-4">
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-bg-dark border border-border-dark rounded-lg shadow-lg z-50 min-w-40 md:min-w-48">
                      {isAdmin && (
                        <button
                          onClick={handleCensorPost}
                          disabled={censoringPost}
                          className={`w-full text-left px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm hover:bg-surface-dark transition border rounded border-white ${
                            isCensored ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {censoringPost ? '...' : isCensored ? '✓ Désactiver la censure' : '⛔ Censurer'}
                        </button>
                      )}
                      {isOwnPost && (
                        <>
                          <button
                            onClick={() => {
                              setShowEditModal(true);
                              setEditedContent(text || "");
                              setEditError(null);
                            }}
                            className="w-full text-left px-3 md:px-4 py-2 md:py-3 text-tick text-xs md:text-sm hover:bg-surface-dark transition border rounded border-white"
                          >
                            Modifier le tweet
                          </button>
                          <button
                            onClick={() => setConfirmDelete(true)}
                            className="w-full text-left px-3 md:px-4 py-2 md:py-3 text-error text-xs md:text-sm hover:bg-surface-dark transition border rounded border-white"
                          >
                            Supprimer le tweet
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                </>
              )}
            </div>
          </div>

          {isCensored ? (
            <div className="mt-3 bg-red-900/40 border-2 border-red-600 rounded-lg p-4 md:p-5">
              <p className="text-red-300 font-bold text-base md:text-lg">🚫 CONTENU CENSURÉ </p>
              <p className="text-red-200 text-sm md:text-base mt-2">Ce message enfreint les conditions d'utilisation de la plateforme</p>
            </div>
          ) : userBlocked ? (
            <div className="mt-3 bg-red-100 border border-red-400 rounded-lg p-3 md:p-4">
              <p className="text-red-800 font-semibold text-sm md:text-base">⛔ Cet utilisateur a été banni</p>
              <p className="text-red-700 text-xs md:text-sm italic mt-1">son compte a été suspendu pour non respect des conditions d'utilisation</p>
            </div>
          ) : text && (
            <p className="mt-2 text-sm md:text-base leading-6 text-text-white whitespace-pre-wrap">
              <InteractiveText 
                text={text} 
                onHashtagClick={(tag) => navigate(`/search/hashtag/${tag}`)}
                onMentionClick={(mention) => navigate(`/profile/${mention}`)}
              />
            </p>
          )}

          {/* Media Display */}
          {!isCensored && image && (
            <div className="mt-3 rounded-lg overflow-hidden bg-surface-dark max-h-96">
              {image.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={image} alt="Post" className="w-full h-auto object-cover" />
              ) : (
                <video src={image} controls className="w-full h-auto" />
              )}
            </div>
          )}

          {/* Like Error Message */}
          {likeError && (
            <div className="mt-3 bg-red-100 border border-red-400 rounded-lg p-2 md:p-3">
              <p className="text-red-800 text-xs md:text-sm">{likeError}</p>
            </div>
          )}

          {/* Reply Form - Show when toggled */}
          {!isCensored && showReplyForm && (
            <ReplyForm 
              postId={Number(id) || 0}
              onReplyCreated={handleReplyCreated}
              onCancel={() => setShowReplyForm(false)}
            />
          )}

          {/* Section des réponses */}
          {!isCensored && repliesCount > 0 && (
            <div className="mt-4 border-t border-border-dark pt-4">
              <button
                onClick={handleShowReplies}
                className="flex items-center gap-2 text-primary hover:underline text-xs md:text-sm mb-3"
              >
                {showReplies ? '▼' : '▶'} {repliesCount} {repliesCount === 1 ? 'réponse' : 'réponses'}
              </button>

              {showReplies && (
                <div className="space-y-3">
                  {loadingReplies ? (
                    <div className="text-center text-text-muted text-xs md:text-sm py-4">Chargement des réponses...</div>
                  ) : replies.length === 0 ? (
                    <div className="text-center text-text-muted text-xs md:text-sm py-4">Aucune réponse pour l'instant</div>
                  ) : (
                    replies.map((reply) => (
                      <Reply 
                        key={reply.id}
                        reply={reply}
                        onDelete={handleReplyDeleted}
                        isOwner={reply.user?.id === currentUserId}
                        isAdmin={false} // You might want to get this from current user context
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
          <div className="bg-bg-dark border border-border-dark rounded-2xl max-w-md w-full p-4 md:p-6 shadow-xl">
            <h2 className="text-xl md:text-2xl font-bold text-text-white mb-4">Modifier le tweet</h2>
            
            {editError && (
              <div className="mb-4 bg-red-100 border border-red-400 rounded-lg p-3">
                <p className="text-red-800 text-xs md:text-sm">{editError}</p>
              </div>
            )}

            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-4 py-3 bg-surface-dark border border-border-dark rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-tick resize-none"
              rows={5}
              placeholder="Modifiez votre tweet..."
              disabled={editLoading}
            />

            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="px-4 py-2 rounded-full border border-border-dark text-text-white hover:bg-surface-dark transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editLoading || !editedContent.trim()}
                className="px-6 py-2 rounded-full bg-tick text-text-white font-bold hover:bg-tick/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-bg-dark border border-white rounded-2xl p-4 md:p-6 max-w-sm mx-4">
            <h2 className="text-lg md:text-xl font-bold mb-2">Supprimer le tweet ?</h2>
            <p className="text-text-muted mb-6 text-xs md:text-sm">
              Cette action est irréversible. Le tweet sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-border-dark rounded-full text-xs md:text-sm hover:bg-surface-dark transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-error text-text-white rounded-full text-xs md:text-sm hover:bg-error/90 transition disabled:opacity-50"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
