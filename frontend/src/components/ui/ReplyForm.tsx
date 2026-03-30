import React, { useState, useEffect } from 'react';
import { type Reply, createReply, getCurrentUser, getMediaUrl } from '../../lib/api';

// Composants pour afficher une réponse individuelle (Reply),


interface ReplyFormProps {
  postId: number;
  onReplyCreated?: (reply: Reply) => void;
  onCancel?: () => void;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({ postId, onReplyCreated, onCancel }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = getCurrentUser();
  const maxLength = 500;

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Generate avatar URL with fallback to picsum.photos
  const getAvatarUrl = () => {
    if (currentUser?.pp && currentUser.pp.trim()) {
      return getMediaUrl(currentUser.pp);
    }
    return `https://picsum.photos/seed/${encodeURIComponent(currentUser?.user || currentUser?.username || 'user')}/200`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('La réponse ne peut pas être vide');
      return;
    }

    if (content.length > maxLength) {
      setError(`La réponse ne peut pas dépasser ${maxLength} caractères`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createReply(postId, content.trim());
    setIsSubmitting(false);

    if (result.reply) {
      setContent('');
      onReplyCreated?.(result.reply);
    } else {
      setError(result.error || 'Erreur lors de la création de la réponse. Veuillez réessayer.');
    }
  };

  return (
    <div className="border-t border-textSecondary/20 pt-4 mt-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* User info and avatar */}
        <div className="flex gap-3">
          {/* Avatar */}
          <img
            src={getAvatarUrl()}
            alt={currentUser?.name || 'User'}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />

          {/* Input area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              placeholder="Répondre à ce tweet..."
              rows={3}
              maxLength={maxLength}
              className="w-full bg-primary/5 text-textPrimary placeholder-textSecondary/50 rounded-lg border border-textSecondary/20 p-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none"
            />
            
            {/* Character count */}
            <div className="flex justify-between items-center mt-2 text-xs text-textSecondary">
              <span>{content.length}/{maxLength}</span>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-2 text-red-500 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
                {error}
              </div>
            )}

            {/* Submit buttons */}
            <div className="flex gap-2 justify-end mt-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-textSecondary hover:bg-primary/10 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Répondre'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
