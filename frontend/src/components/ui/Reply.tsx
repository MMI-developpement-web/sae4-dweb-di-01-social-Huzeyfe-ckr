import React, { useState, useRef, useEffect } from 'react';
import { type Reply as ReplyType, deleteReply, updateReply, getMediaUrl } from '../../lib/api';

// Reply Data Props - contient les données de la réponse
interface ReplyDataProps {
  reply: ReplyType;
  isOwner?: boolean;
  isAdmin?: boolean;
}

// Reply View Props - contient les callbacks
interface ReplyViewProps {
  onDelete?: (replyId: number) => void;
  onUpdate?: (replyId: number, newContent: string) => void;
}

export const Reply: React.FC<ReplyDataProps & ReplyViewProps> = ({ reply, onDelete, onUpdate, isOwner, isAdmin }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedContent, setEditedContent] = useState(reply.content);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

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
    setIsDeleting(true);
    const success = await deleteReply(reply.id);
    setIsDeleting(false);

    if (success) {
      setDeleteConfirm(false);
      setShowMenu(false);
      onDelete?.(reply.id);
    } else {
      alert('Erreur lors de la suppression de la réponse');
    }
  };

  const handleEditSubmit = async () => {
    if (!editedContent.trim()) {
      setEditError('La réponse ne peut pas être vide');
      return;
    }

    if (editedContent.length > 500) {
      setEditError('La réponse ne peut pas dépasser 500 caractères');
      return;
    }

    setEditLoading(true);
    setEditError(null);

    const result = await updateReply(reply.id, editedContent.trim());

    if (result.success) {
      setEditedContent(editedContent.trim());
      onUpdate?.(reply.id, editedContent.trim());
      setShowEditModal(false);
      setShowMenu(false);
    } else {
      setEditError(result.error || 'Erreur lors de la modification');
    }

    setEditLoading(false);
  };

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

        {/* Timestamp and 3-dot menu */}
        <div className="flex items-center gap-2">
          <span className="text-textSecondary text-xs">
            {formatDate(reply.createdAt)}
          </span>

          {(isOwner || isAdmin) && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-text-muted hover:text-primary transition p-1 rounded hover:bg-primary/10"
                title="Options"
              >
                ⋯
              </button>

              {showMenu && (
                <div className="absolute right-0 top-6 bg-black border border-border-dark rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setEditError(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-text-white hover:bg-primary/20 transition first:rounded-t-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier

                  </button>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition last:rounded-b-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              )}
            </div>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-text-white mb-4">Modifier la réponse</h2>

            <textarea
              value={editedContent}
              onChange={(e) => {
                setEditedContent(e.target.value);
                setEditError(null);
              }}
              className="w-full bg-surface border border-border-dark text-text-white rounded-lg p-3 mb-2 focus:outline-none focus:border-primary/50 resize-none"
              rows={4}
              maxLength={500}
            />

            <div className={`text-xs mb-3 ${editedContent.length > 500 ? 'text-red-500' : 'text-textSecondary'}`}>
              {editedContent.length}/500 caractères
            </div>

            {editError && (
              <div className="text-sm text-red-400 mb-3 bg-red-500/10 px-3 py-2 rounded-lg">
                {editError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditedContent(reply.content);
                  setEditError(null);
                }}
                disabled={editLoading}
                className="flex-1 px-4 py-2 text-sm text-text-white border border-border-dark rounded-lg hover:bg-surface-light transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editLoading || editedContent.length === 0 || editedContent.length > 500}
                className="flex-1 px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/80 transition disabled:opacity-50"
              >
                {editLoading ? '...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-text-white mb-4">Supprimer la réponse?</h2>
            
            <p className="text-textSecondary text-sm mb-6">
              Êtes-vous sûr de vouloir supprimer cette réponse? Cette action est irréversible.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm text-text-white border border-border-dark rounded-lg hover:bg-surface-light transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? '...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
