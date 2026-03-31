import React, { useState } from 'react';
import { type Reply as ReplyType, deleteReply, getMediaUrl } from '../../lib/api';

// Composants pour afficher une réponse individuelle (Reply)


interface ReplyProps {
  reply: ReplyType;
  onDelete?: (replyId: number) => void;
  isOwner?: boolean;
  isAdmin?: boolean;
}

export const Reply: React.FC<ReplyProps> = ({ reply, onDelete, isOwner, isAdmin }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this reply?')) return;

    setIsDeleting(true);
    const success = await deleteReply(reply.id);
    setIsDeleting(false);

    if (success) {
      onDelete?.(reply.id);
    } else {
      alert('Failed to delete reply');
    }
  };

  const canDelete = isOwner || isAdmin;

  // Generate avatar URL with fallback to picsum.photos
  const getAvatarUrl = () => {
    if (reply.user?.pp && reply.user.pp.trim()) {
      return getMediaUrl(reply.user.pp);
    }
    return `https://picsum.photos/seed/${encodeURIComponent(reply.user?.username || 'user')}/200`;
  };

  return (
    <div className="border-l-2 border-textSecondary/30 pl-4 py-3 hover:bg-primary/5 transition-colors">
      {/* Header with author info and timestamp */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Author avatar */}
          <img
            src={getAvatarUrl()}
            alt={reply.user.displayName}
            className={`w-8 h-8 rounded-full object-cover flex-shrink-0 ${
              reply.user.blocked ? 'grayscale opacity-50' : ''
            }`}
          />

          {/* Author name and handle */}
          <div className="flex flex-col">
            <span className={`font-semibold text-sm ${
              reply.user?.blocked ? 'text-textSecondary/60 line-through' : 'text-textPrimary'
            }`}>
              {reply.user?.displayName || reply.user?.username}
            </span>
            <span className="text-textSecondary text-xs">
              @{reply.user?.username}
            </span>
          </div>
        </div>

        {/* Timestamp and action buttons */}
        <div className="flex items-center gap-2">
          <span className="text-textSecondary text-xs">
            {formatDate(reply.createdAt)}
          </span>

          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-2 text-red-500 hover:text-red-600 disabled:opacity-50 text-xs font-medium"
              title="Delete reply"
            >
              {isDeleting ? '...' : '✕'}
            </button>
          )}
        </div>
      </div>

      {/* Blocked user warning */}
      {reply.user?.blocked && (
        <div className="mb-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
          ⚠️ This user is blocked
        </div>
      )}

      {/* Reply content */}
      <div className="text-textPrimary text-sm leading-relaxed">
        {reply.content}
      </div>

      {/* Media display */}
      {reply.mediaUrl && (() => {
        const mediaUrl = getMediaUrl(reply.mediaUrl);
        if (!mediaUrl) return null;
        const isImage = mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        return (
          <div className="mt-3 rounded-lg overflow-hidden bg-surface-dark max-h-48">
            {isImage ? (
              <img src={mediaUrl} alt="Reply media" className="w-full h-auto object-cover" />
            ) : (
              <video src={mediaUrl} controls className="w-full h-auto max-h-48" />
            )}
          </div>
        );
      })()}
    </div>
  );
};
