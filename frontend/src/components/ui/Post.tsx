import { useState, useEffect } from "react";
import {
  deletePost,
  likePost,
  unlikePost,
  updatePost,
  retweetPost,
  unretweetPost,
  pinPost,
  unpinPost,
  getCurrentUser,
  getReplies,
} from "../../lib/api";
import RetweetModal from "./RetweetModal";
import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";
import { PostContent } from "./PostContent";
import { PostMenu } from "./PostMenu";
import { PostReplies } from "./PostReplies";
import { PostModals } from "./PostModals";

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString.replace(" ", "T"));
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
  return `${years}an${years > 1 ? "s" : ""}`;
}

// Post Data Props - contient toutes les données du post
interface PostDataProps {
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
  retweets?: number;
  retweeted?: boolean;
  userBlocked?: boolean;
  userReadOnly?: boolean;
  censored?: boolean;
  isAdmin?: boolean;
  isPinned?: boolean;
  retweetedFromPost?: any;
}

// Post View Props - contient les callbacks et propriétés de présentation
interface PostViewProps {
  onDelete?: () => void;
  onCensored?: (censored: boolean) => void;
  onLikeChange?: (liked: boolean, likeCount: number) => void;
  onRetweetChange?: (retweeted: boolean, retweetCount: number) => void;
  onEdit?: (newContent: string) => void;
}

export default function Post({
  id,
  name,
  handle,
  avatar,
  time,
  text,
  image,
  userId,
  currentUserId,
  likes: initialLikes = 0,
  liked: initialLiked = false,
  retweets: initialRetweets = 0,
  retweeted: initialRetweeted = false,
  userBlocked = false,
  userReadOnly = false,
  censored = false,
  isAdmin = false,
  isPinned = false,
  retweetedFromPost,
  onDelete,
  onCensored,
  onLikeChange,
  onRetweetChange,
  onEdit,
}: PostDataProps & PostViewProps) {
  const displayTime = formatRelativeTime(time);
  const isOwnPost = userId === currentUserId;

  // UI State
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showRetweetModal, setShowRetweetModal] = useState(false);

  // Like State
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [likingLoading, setLikingLoading] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  // Retweet State
  const [retweeted, setRetweeted] = useState(initialRetweeted);
  const [retweetCount, setRetweetCount] = useState(initialRetweets);
  const [retweetingLoading, setRetweetingLoading] = useState(false);

  // Edit State
  const [editedContent, setEditedContent] = useState(text || "");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete State
  const [deleting, setDeleting] = useState(false);

  // Censor State
  const [isCensored, setIsCensored] = useState(censored);
  const [censoringPost, setCensoringPost] = useState(false);

  // Replies State
  const [repliesCount, setRepliesCount] = useState(0);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Load replies count on mount
  useEffect(() => {
    const loadRepliesCount = async () => {
      if (!id) return;
      try {
        const loadedReplies = await getReplies(Number(id));
        setRepliesCount(loadedReplies.length);
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

  // Handlers
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
          setLikeError(
            result.error || "Erreur lors du retrait du like. Veuillez réessayer."
          );
        }
      } else {
        const result = await likePost(Number(id));
        if (result.success) {
          setLiked(true);
          const newCount = likeCount + 1;
          setLikeCount(newCount);
          onLikeChange?.(true, newCount);
        } else {
          setLikeError(
            result.error || "Erreur lors du like. Veuillez réessayer."
          );
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setLikeError("Erreur lors du like. Veuillez réessayer.");
    } finally {
      setLikingLoading(false);
    }
  };

  const handleRetweetClick = async (comment?: string) => {
    if (!id) return;
    setRetweetingLoading(true);
    setShowRetweetModal(false);
    try {
      if (retweeted) {
        const result = await unretweetPost(Number(id));
        if (result.success) {
          setRetweeted(false);
          const newCount = Math.max(0, retweetCount - 1);
          setRetweetCount(newCount);
          onRetweetChange?.(false, newCount);
        }
      } else {
        const result = await retweetPost(Number(id), comment);
        if (result.success) {
          setRetweeted(true);
          const newCount = retweetCount + 1;
          setRetweetCount(newCount);
          onRetweetChange?.(true, newCount);
        }
      }
    } catch (error) {
      console.error("Error toggling retweet:", error);
    } finally {
      setRetweetingLoading(false);
    }
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

  const handlePinClick = async () => {
    if (!id) return;
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      let success = false;
      if (isPinned) {
        const result = await unpinPost(currentUser.id, Number(id));
        success = result.success;
        if (success && result.pinnedPostIds) {
          currentUser.pinnedPostIds = result.pinnedPostIds;
        }
      } else {
        const result = await pinPost(currentUser.id, Number(id));
        success = result.success;
        if (success && result.pinnedPostIds) {
          currentUser.pinnedPostIds = result.pinnedPostIds;
        }
      }

      if (success) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        alert(isPinned ? "Erreur lors du désépinglage" : "Erreur lors de l'épinglage");
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert("Erreur lors du changement d'épinglage");
    }
  };

  const handleCensorPost = async () => {
    if (!id || !isAdmin) return;
    setCensoringPost(true);
    try {
      const method = isCensored ? "DELETE" : "POST";
      const res = await fetch(`/api/admin/posts/${id}/censor`, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (res.ok) {
        setIsCensored(!isCensored);
        onCensored?.(!isCensored);
      }
    } catch (error) {
      console.error("Error censoring post:", error);
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
        onEdit?.(editedContent.trim());
        setShowEditModal(false);
        setShowMenu(false);
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

  const handleReplyCreated = () => {
    setRepliesCount(repliesCount + 1);
  };

  return (
    <article className="w-full">
      <div className="flex items-start gap-2 md:gap-3">
        {/* Header - includes avatar and name/handle/time */}
        <PostHeader
          name={name}
          handle={handle}
          avatar={avatar}
          time={displayTime}
          userId={userId}
          userBlocked={userBlocked}
          isPinned={isPinned}
        />

        {/* Menu Button - positioned top right */}
        {isOwnPost && (
          <div className="relative ml-auto">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-muted hover:text-tick transition p-1.5 md:p-2 rounded-full hover:bg-tick/10"
              aria-label="Options du tweet"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="md:w-4 md:h-4"
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>

            <PostMenu
              isOpen={showMenu}
              isOwnPost={isOwnPost}
              isAdmin={isAdmin}
              isCensored={isCensored}
              isPinned={isPinned}
              censoringPost={censoringPost}
              onClose={() => setShowMenu(false)}
              onEditClick={() => {
                setShowEditModal(true);
                setEditedContent(text || "");
                setEditError(null);
              }}
              onDeleteClick={() => setConfirmDelete(true)}
              onCensorClick={handleCensorPost}
              onPinClick={handlePinClick}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="ml-[calc(48px_+_0.5rem)] md:ml-[calc(48px_+_0.75rem)]">
        {/* Content */}
        <PostContent
          text={text}
          image={image}
          isCensored={isCensored}
          userBlocked={userBlocked}
          retweetedFromPost={retweetedFromPost}
          likeError={likeError}
        />

        {/* Actions */}
        <PostActions
          liked={liked}
          likeCount={likeCount}
          likingLoading={likingLoading}
          retweeted={retweeted}
          retweetCount={retweetCount}
          retweetingLoading={retweetingLoading}
          repliesCount={repliesCount}
          userReadOnly={userReadOnly}
          onLikeClick={handleLikeClick}
          onRetweetClick={() => {
            if (retweeted) {
              handleRetweetClick();
            } else {
              setShowRetweetModal(true);
            }
          }}
          onReplyFormToggle={() => setShowReplyForm(!showReplyForm)}
        />

        {/* Replies */}
        {!isCensored && (
          <PostReplies
            postId={id}
            repliesCount={repliesCount}
            isCensored={isCensored}
            currentUserId={currentUserId}
            showReplyForm={showReplyForm}
            onShowReplyForm={setShowReplyForm}
            onReplyCreated={handleReplyCreated}
          />
        )}
      </div>

      {/* Modals */}
      <PostModals
        showEditModal={showEditModal}
        editedContent={editedContent}
        editError={editError}
        editLoading={editLoading}
        confirmDelete={confirmDelete}
        deleting={deleting}
        onEditClose={() => setShowEditModal(false)}
        onEditContentChange={setEditedContent}
        onEditSubmit={handleEditSubmit}
        onDeleteConfirmClose={() => setConfirmDelete(false)}
        onDeleteConfirm={handleDeleteClick}
      />

      {/* Retweet Modal */}
      <RetweetModal
        isOpen={showRetweetModal}
        onClose={() => setShowRetweetModal(false)}
        onRetweet={handleRetweetClick}
        isLoading={retweetingLoading}
        authorName={name}
        originalContent={text || ""}
      />
    </article>
  );
}
