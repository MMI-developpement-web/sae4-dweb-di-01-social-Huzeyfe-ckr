interface PostActionsDataProps {
  liked: boolean;
  likeCount: number;
  likingLoading: boolean;
  retweeted: boolean;
  retweetCount: number;
  retweetingLoading: boolean;
  repliesCount: number;
  userReadOnly?: boolean;
}

interface PostActionsViewProps {
  onLikeClick: () => void;
  onRetweetClick: () => void;
  onReplyFormToggle: () => void;
}

export function PostActions({
  liked,
  likeCount,
  likingLoading,
  retweeted,
  retweetCount,
  retweetingLoading,
  repliesCount,
  userReadOnly = false,
  onLikeClick,
  onRetweetClick,
  onReplyFormToggle,
}: PostActionsDataProps & PostActionsViewProps) {
  return (
    <div className="flex items-center gap-1 md:gap-3 shrink-0">
      {/* Reply Button - Hidden if user readOnly */}
      {!userReadOnly && (
        <button
          onClick={onReplyFormToggle}
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

      {/* Like Button - Hidden if user readOnly */}
      {!userReadOnly && (
        <button
          onClick={onLikeClick}
          disabled={likingLoading}
          className={`flex items-center gap-1 transition disabled:opacity-50 text-xs md:text-sm ${
            liked ? "text-error hover:text-error/90" : "text-text-muted hover:text-error"
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
      )}

      {/* Retweet Button - Hidden if user readOnly */}
      {!userReadOnly && (
        <button
          onClick={onRetweetClick}
          disabled={retweetingLoading}
          className={`flex items-center gap-1 transition disabled:opacity-50 text-xs md:text-sm ${
            retweeted ? "text-tick hover:text-tick/90" : "text-text-muted hover:text-tick"
          }`}
          aria-label={retweeted ? "Undo Retweet" : "Retweet"}
          title={
            retweeted
              ? "Supprimer le retweet"
              : "Retweet avec commentaire optional"
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={retweeted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="md:w-4 md:h-4"
          >
            <polyline points="17 2 19 4 17 6"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 22 5 20 7 18"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          <span className="text-xs md:text-sm">{retweetCount}</span>
        </button>
      )}
    </div>
  );
}
