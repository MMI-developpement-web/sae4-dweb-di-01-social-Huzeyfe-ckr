import { useState } from 'react';
import Button from './Button';

// RetweetModal Data Props - contient les données du retweet
interface RetweetModalDataProps {
  isOpen: boolean;
  isLoading: boolean;
  authorName: string;
  originalContent: string;
}

// RetweetModal View Props - contient les callbacks
interface RetweetModalViewProps {
  onClose: () => void;
  onRetweet: (comment?: string) => void;
}

export default function RetweetModal({
  isOpen,
  onClose,
  onRetweet,
  isLoading,
  authorName,
  originalContent,
}: RetweetModalDataProps & RetweetModalViewProps) {
  const [comment, setComment] = useState('');

  const handleRetweet = () => {
    onRetweet(comment || undefined);
    setComment('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-dark border border-dark rounded-lg w-full max-w-md p-4 shadow-xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">Partager ce tweet</h2>
          <p className="text-sm text-gray-400 mt-1">
            Retweet par <span className="font-semibold">{authorName}</span>
          </p>
        </div>

        {/* Original post preview */}
        <div className="mb-4 p-3 bg-surface-dark rounded-lg border border-border-dark">
          <p className="text-sm text-white break-words line-clamp-3">
            {originalContent}
          </p>
        </div>

        {/* Optional comment field */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 block mb-2">
            Ajouter un commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partager vos pensées..."
            className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 resize-none"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length} / 280 caractères
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="dark"
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleRetweet}
            variant="solid"
            disabled={isLoading}
            className="flex-1 bg-tick hover:bg-tick/90"
          >
            {isLoading ? '...' : '🔄 Retweet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
