interface PostMenuDataProps {
  isOpen: boolean;
  isOwnPost: boolean;
  isAdmin: boolean;
  isCensored: boolean;
  isPinned: boolean;
  censoringPost: boolean;
}

interface PostMenuViewProps {
  onClose: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCensorClick: () => void;
  onPinClick: () => void;
}

export function PostMenu({
  isOpen,
  isOwnPost,
  isAdmin,
  isCensored,
  isPinned,
  censoringPost,
  onClose,
  onEditClick,
  onDeleteClick,
  onCensorClick,
  onPinClick,
}: PostMenuDataProps & PostMenuViewProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-8 bg-bg-dark border border-border-dark rounded-lg shadow-lg z-50 min-w-40 md:min-w-48">
      {isAdmin && (
        <button
          onClick={() => {
            onCensorClick();
            onClose();
          }}
          disabled={censoringPost}
          className={`w-full text-left px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm hover:bg-surface-dark transition border rounded border-white ${
            isCensored ? "text-green-500" : "text-red-500"
          }`}
        >
          {censoringPost ? "..." : isCensored ? "✓ Désactiver la censure" : "⛔ Censurer"}
        </button>
      )}

      {isOwnPost && (
        <>
          <button
            onClick={() => {
              onEditClick();
              onClose();
            }}
            className="w-full text-left px-3 md:px-4 py-2 md:py-3 text-tick text-xs md:text-sm hover:bg-surface-dark transition border rounded border-white"
          >
            Modifier le tweet
          </button>

          <button
            onClick={() => {
              onDeleteClick();
              onClose();
            }}
            className="w-full text-left px-3 md:px-4 py-2 md:py-3 text-error text-xs md:text-sm hover:bg-surface-dark transition border rounded border-white"
          >
            Supprimer le tweet
          </button>

          <button
            onClick={() => {
              onPinClick();
              onClose();
            }}
            className={`w-full text-left px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm hover:bg-surface-dark transition border rounded border-white ${
              isPinned ? "text-yellow-500" : "text-text-muted"
            }`}
          >
            {isPinned ? "📌 Désépingler" : "📌 Épingler le tweet"}
          </button>
        </>
      )}
    </div>
  );
}
