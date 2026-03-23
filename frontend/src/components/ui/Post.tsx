
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { deletePost, likePost, unlikePost } from "../../lib/api";

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
  onDelete?: () => void;
  onLikeChange?: (liked: boolean, likeCount: number) => void;
}

export default function Post({ id, name, handle, avatar, time, text, userId, currentUserId, likes: initialLikes = 0, liked: initialLiked = false, onDelete, onLikeChange }: PostProps) {
  const navigate = useNavigate();
  const displayTime = formatRelativeTime(time);
  const handleStr = typeof handle === 'string' ? handle : String(handle);
  const initials = handleStr?.charAt(1)?.toUpperCase() ?? handleStr?.charAt(0)?.toUpperCase() ?? "U";
  
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [likingLoading, setLikingLoading] = useState(false);

  const isOwnPost = userId === currentUserId;

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
    try {
      if (liked) {
        const success = await unlikePost(Number(id));
        if (success) {
          setLiked(false);
          const newCount = Math.max(0, likeCount - 1);
          setLikeCount(newCount);
          onLikeChange?.(false, newCount);
        }
      } else {
        const success = await likePost(Number(id));
        if (success) {
          setLiked(true);
          const newCount = likeCount + 1;
          setLikeCount(newCount);
          onLikeChange?.(true, newCount);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLikingLoading(false);
    }
  };

  return (
    <article className="mb-6">
      <div className="flex items-start gap-3">
        <button
          onClick={() => userId && navigate(`/profile/${userId}`)}
          className="hover:opacity-80 transition"
          aria-label={`View ${name}'s profile`}
        >
          <Avatar size="md" src={avatar} alt={`${name} avatar`}>
            <div className="flex items-center justify-center w-full h-full text-sm font-bold text-text-white">{initials}</div>
          </Avatar>
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-white">{name}</span>
              <span className="text-text-muted text-sm">{handleStr} · {displayTime}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Like Button - Cœur à droite */}
              <button
                onClick={handleLikeClick}
                disabled={likingLoading}
                className={`flex items-center gap-1 transition disabled:opacity-50 ${
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
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-sm">{likeCount}</span>
              </button>

              {/* Menu Button - 3 dots en horizontales */}
              {isOwnPost && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className=" text-text-muted hover:text-tick transition p-2 rounded-full hover:bg-tick/10"
                    aria-label="Options du tweet"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-bg-dark border border-border-dark rounded-lg shadow-lg z-50 min-w-48">
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="w-full text-left px-4 py-3 text-error hover:bg-surface-dark transition border rounded border-white"
                      >
                        Supprimer le tweet
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {text && (
            <p className="mt-2 text-sm leading-6 text-text-white whitespace-pre-wrap">{text}</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="bg-bg-dark border border-white rounded-2xl p-6 max-w-sm mx-4">
            <h2 className="text-xl font-bold mb-2">Supprimer le tweet ?</h2>
            <p className="text-text-muted mb-6">
              Cette action est irréversible. Le tweet sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-border-dark rounded-full hover:bg-surface-dark transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-error text-text-white rounded-full hover:bg-error/90 transition disabled:opacity-50"
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
