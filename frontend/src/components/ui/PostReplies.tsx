import { useState } from "react";
import { type Reply as ReplyType, getReplies } from "../../lib/api";
import { Reply } from "./Reply";
import { ReplyForm } from "./ReplyForm";

interface PostRepliesDataProps {
  postId: number | string | undefined;
  repliesCount: number;
  isCensored: boolean;
  currentUserId?: number;
}

interface PostRepliesViewProps {
  onReplyCreated?: (reply: ReplyType) => void;
}

export function PostReplies({
  postId,
  repliesCount,
  isCensored,
  currentUserId,
  onReplyCreated,
}: PostRepliesDataProps & PostRepliesViewProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<ReplyType[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const loadReplies = async () => {
    if (!postId) return;
    setLoadingReplies(true);
    try {
      const loadedReplies = await getReplies(Number(postId));
      setReplies(loadedReplies);
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
    setShowReplyForm(false);
    onReplyCreated?.(newReply);
  };

  const handleReplyDeleted = (replyId: number) => {
    setReplies(replies.filter((r) => r.id !== replyId));
  };

  return (
    <>
      {/* Reply Form Toggle */}
      <div className="flex items-center justify-between mt-4">
        {repliesCount > 0 && (
          <button
            onClick={handleShowReplies}
            className="flex items-center gap-2 text-primary hover:underline text-xs md:text-sm"
          >
            {showReplies ? "▼" : "▶"} {repliesCount}{" "}
            {repliesCount === 1 ? "réponse" : "réponses"}
          </button>
        )}
      </div>

      {/* Reply Form */}
      {!isCensored && (
        <div className="mt-3">
          {showReplyForm && (
            <ReplyForm
              postId={Number(postId) || 0}
              onReplyCreated={handleReplyCreated}
              onCancel={() => setShowReplyForm(false)}
            />
          )}
        </div>
      )}

      {/* Replies List */}
      {!isCensored && showReplies && repliesCount > 0 && (
        <div className="mt-4 border-t border-border-dark pt-4">
          <div className="space-y-3">
            {loadingReplies ? (
              <div className="text-center text-text-muted text-xs md:text-sm py-4">
                Chargement des réponses...
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center text-text-muted text-xs md:text-sm py-4">
                Aucune réponse pour l'instant
              </div>
            ) : (
              replies.map((reply) => (
                <Reply
                  key={reply.id}
                  reply={reply}
                  onDelete={handleReplyDeleted}
                  isOwner={reply.user?.id === currentUserId}
                  isAdmin={false}
                />
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
