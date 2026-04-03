import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { getUserByUsername, getMediaUrl } from "../../lib/api";
import { InteractiveText } from "../../lib/hashtagParser";

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

interface PostContentDataProps {
  text?: string;
  image?: string;
  isCensored: boolean;
  userBlocked: boolean;
  retweetedFromPost?: any;
  likeError?: string | null;
  retweetError?: string | null;
  replyError?: string | null;
}

interface PostContentViewProps {}

export function PostContent({
  text,
  image,
  isCensored,
  userBlocked,
  retweetedFromPost,
  likeError,
  retweetError,
  replyError,
}: PostContentDataProps & PostContentViewProps) {
  const navigate = useNavigate();

  // Callback for mention clicks - wrap async logic
  const handleMentionClick = useCallback(async (mention: string) => {
    try {
      const user = await getUserByUsername(mention);
      if (user) {
        navigate(`/profile/${user.id}`);
      }
    } catch (error) {
      console.error(`Error navigating to @${mention}:`, error);
    }
  }, [navigate]);

  return (
    <>
      {isCensored ? (
        <div className="mt-3 p-4 md:p-5 rounded-lg bg-red-900/40 border-2 border-red-600">
          <p className="text-red-300 font-bold text-base md:text-lg">🚫 CONTENU CENSURÉ</p>
          <p className="text-red-200 text-sm md:text-base mt-2">
            Ce message enfreint les conditions d'utilisation de la plateforme
          </p>
        </div>
      ) : userBlocked ? (
        <div className="mt-3 p-3 md:p-4 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-400">
          <p className="text-red-800 dark:text-red-300 font-semibold text-sm md:text-base">
            ⛔ Cet utilisateur a été banni
          </p>
          <p className="text-red-700 dark:text-red-400 text-xs md:text-sm italic mt-1">
            son compte a été suspendu pour non respect des conditions d'utilisation
          </p>
        </div>
      ) : (
        text && (
          <p className="mt-2 text-sm md:text-base leading-6 text-text-white whitespace-pre-wrap">
            <InteractiveText
              text={text}
              onHashtagClick={(tag) =>
                navigate(`/search/hashtag/${tag}`)
              }
              onMentionClick={handleMentionClick}
            />
          </p>
        )
      )}

      {/* Retweet Original Post Display */}
      {!isCensored && retweetedFromPost && (
        <div
          className="mt-3 border border-border-dark rounded-lg p-3 bg-surface-dark/50 hover:bg-surface-dark transition cursor-pointer"
          onClick={() => {
            if (retweetedFromPost.user?.id) {
              navigate(`/profile/${retweetedFromPost.user.id}`);
            }
          }}
        >
          {/* Original post header */}
          <div className="flex items-start gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                retweetedFromPost.user?.id &&
                  navigate(`/profile/${retweetedFromPost.user.id}`);
              }}
              className="hover:opacity-80 transition shrink-0"
            >
              {retweetedFromPost.user?.pp &&
              retweetedFromPost.user.pp !== "null" ? (
                <img
                  src={getMediaUrl(retweetedFromPost.user.pp)}
                  alt={`${retweetedFromPost.user?.name} avatar`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(
                    retweetedFromPost.user?.user || "unknown"
                  )}/200`}
                  alt={`${retweetedFromPost.user?.name} avatar`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-white text-xs md:text-sm truncate">
                    {retweetedFromPost.user?.name}
                  </span>
                  <span className="text-text-muted text-xs">
                    {retweetedFromPost.user?.user}
                  </span>
                </div>
                <span className="text-text-muted text-xs">
                  {retweetedFromPost.time ||
                    formatRelativeTime(retweetedFromPost.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Original post content */}
          {retweetedFromPost.content && (
            <p className="text-xs md:text-sm leading-5 text-text-white mb-2">
              <InteractiveText
                text={retweetedFromPost.content}
                onHashtagClick={(tag) =>
                  navigate(`/search/hashtag/${tag}`)
                }
                onMentionClick={handleMentionClick}
              />
            </p>
          )}

          {/* Original post media */}
          {retweetedFromPost.mediaUrl &&
            retweetedFromPost.mediaUrl !== image && (
              <div className="mt-2 rounded-lg overflow-hidden bg-surface-dark max-h-48">
                {getMediaUrl(retweetedFromPost.mediaUrl)?.match(
                  /\.(jpg|jpeg|png|gif|webp)$/i
                ) ? (
                  <img
                    src={getMediaUrl(retweetedFromPost.mediaUrl)}
                    alt="Original post media"
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <video
                    src={getMediaUrl(retweetedFromPost.mediaUrl)}
                    controls
                    className="w-full h-auto max-h-48"
                  />
                )}
              </div>
            )}

          {/* Original post stats */}
          <div className="flex items-center gap-2 md:gap-3 mt-2 text-text-muted text-xs pt-2 border-t border-border-dark">
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {retweetedFromPost.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polyline points="17 2 19 4 17 6"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 22 5 20 7 18"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
              {retweetedFromPost.retweets || 0}
            </span>
          </div>
        </div>
      )}

      {/* Media Display */}
      {!isCensored && image && !retweetedFromPost && (
        <div className="mt-3 rounded-lg overflow-hidden bg-surface-dark max-h-96">
          {getMediaUrl(image)?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img
              src={getMediaUrl(image)}
              alt="Post"
              className="w-full h-auto object-cover"
            />
          ) : (
            <video
              src={getMediaUrl(image)}
              controls
              className="w-full h-auto"
            />
          )}
        </div>
      )}

      {/* Like Error Message */}
      {likeError && (
        <div className="mt-3 bg-red-100 border border-red-400 rounded-lg p-2 md:p-3">
          <p className="text-red-800 text-xs md:text-sm">{likeError}</p>
        </div>
      )}

      {/* Retweet Error Message */}
      {retweetError && (
        <div className="mt-3 bg-red-100 border border-red-400 rounded-lg p-2 md:p-3">
          <p className="text-red-800 text-xs md:text-sm">{retweetError}</p>
        </div>
      )}

      {/* Reply Error Message */}
      {replyError && (
        <div className="mt-3 bg-red-100 border border-red-400 rounded-lg p-2 md:p-3">
          <p className="text-red-800 text-xs md:text-sm">{replyError}</p>
        </div>
      )}
    </>
  );
}
