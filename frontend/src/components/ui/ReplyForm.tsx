import React, { useState, useEffect, useRef } from 'react';
import { type Reply, createReply, getMediaUrl, uploadMedia } from '../../lib/api';
import { useStore } from '../../store/StoreContext';

// Composants pour afficher une réponse individuelle (Reply),


// ReplyForm Data Props - contient les données du formulaire
interface ReplyFormDataProps {
  postId: number;
}

// ReplyForm View Props - contient les callbacks
interface ReplyFormViewProps {
  onReplyCreated?: (reply: Reply) => void;
  onCancel?: () => void;
}

export const ReplyForm: React.FC<ReplyFormDataProps & ReplyFormViewProps> = ({ postId, onReplyCreated, onCancel }) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentUser } = useStore();
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

    const result = await createReply(postId, content.trim(), mediaUrl || undefined);
    setIsSubmitting(false);

    if (result.reply) {
      setContent('');
      setMediaUrl(null);
      onReplyCreated?.(result.reply);
    } else {
      setError(result.error || 'Erreur lors de la création de la réponse. Veuillez réessayer.');
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    setIsUploadingMedia(true);
    setError(null);

    try {
      const result = await uploadMedia(file);
      if (result.mediaUrl) {
        setMediaUrl(result.mediaUrl);
      } else {
        setError(result.error || 'Erreur lors du téléchargement du média');
      }
    } catch (err) {
      setError('Erreur lors du téléchargement du média');
    } finally {
      setIsUploadingMedia(false);
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
            
            {/* Media preview */}
            {mediaUrl && (
              <div className="mt-3 relative">
                {mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img src={getMediaUrl(mediaUrl)} alt="Preview" className="w-full h-auto rounded-lg max-h-40 object-cover" />
                ) : (
                  <video src={getMediaUrl(mediaUrl)} className="w-full h-auto rounded-lg max-h-40" controls />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  title="Remove media"
                >
                  ✕
                </button>
              </div>
            )}
            
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

            {/* Action buttons */}
            <div className="flex gap-2 justify-between items-center mt-3">
              {/* Media upload button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={isUploadingMedia || !!mediaUrl}
                  className="hidden"
                  aria-label="Upload media"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingMedia || !!mediaUrl}
                  className="px-3 py-2 text-sm text-textSecondary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  title={isUploadingMedia ? 'Uploading...' : 'Attach media'}
                >
                  {isUploadingMedia ? '⏳' : '📎'}
                </button>
              </div>

              {/* Submit buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-textSecondary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim() || isUploadingMedia}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Répondre'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
