import { getMediaUrl } from "../../lib/api";

interface PostModalsDataProps {
  showEditModal: boolean;
  editedContent: string;
  editedMediaUrl: string | null;
  editMediaPreview: string | null;
  editMediaUploading: boolean;
  editMediaFile: File | null;
  editError: string | null;
  editLoading: boolean;
  confirmDelete: boolean;
  deleting: boolean;
}

interface PostModalsViewProps {
  onEditClose: () => void;
  onEditContentChange: (content: string) => void;
  onEditMediaSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditMediaUpload: () => void;
  onRemoveEditMedia: () => void;
  onEditSubmit: () => void;
  onDeleteConfirmClose: () => void;
  onDeleteConfirm: () => void;
}

export function PostModals({
  showEditModal,
  editedContent,
  editedMediaUrl,
  editMediaPreview,
  editMediaUploading,
  editMediaFile,
  editError,
  editLoading,
  confirmDelete,
  deleting,
  onEditClose,
  onEditContentChange,
  onEditMediaSelect,
  onEditMediaUpload,
  onRemoveEditMedia,
  onEditSubmit,
  onDeleteConfirmClose,
  onDeleteConfirm,
}: PostModalsDataProps & PostModalsViewProps) {
  return (
    <>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-9999 p-4">
          <div className="bg-bg-dark border border-border-dark rounded-2xl max-w-md w-full p-4 md:p-6 shadow-xl">
            <h2 className="text-xl md:text-2xl font-bold text-text-white mb-4">
              Modifier le tweet
            </h2>

            {editError && (
              <div className="mb-4 bg-red-100 border border-red-400 rounded-lg p-3">
                <p className="text-red-800 text-xs md:text-sm">{editError}</p>
              </div>
            )}

            <textarea
              value={editedContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="w-full px-4 py-3 bg-surface-dark border border-border-dark rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-tick resize-none"
              rows={5}
              placeholder="Modifiez votre tweet..."
              disabled={editLoading}
            />

            {/* Media editing section */}
            <div className="mt-4 space-y-3">
              {/* Media upload button */}
              {!editedMediaUrl && (
                <div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={onEditMediaSelect}
                      disabled={editMediaUploading || editLoading}
                      className="hidden"
                    />
                    <span className={`text-tick hover:text-tick/80 text-sm cursor-pointer inline-block ${editMediaUploading || editLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      📎 Ajouter/Changer média
                    </span>
                  </label>
                </div>
              )}

              {/* Upload button for selected file */}
              {editMediaFile && !editedMediaUrl && (
                <button
                  onClick={onEditMediaUpload}
                  disabled={editMediaUploading || editLoading}
                  className="text-sm bg-tick text-white px-3 py-1 rounded hover:bg-tick/90 disabled:opacity-50"
                >
                  {editMediaUploading ? "Upload..." : "Upload média"}
                </button>
              )}

              {/* Media preview */}
              {(editMediaPreview || editedMediaUrl) && (
                <div className="relative bg-surface-dark rounded-lg overflow-hidden max-h-48">
                  {editMediaPreview ? (
                    editMediaFile?.type.startsWith('image/') ? (
                      <img src={editMediaPreview} alt="Preview" className="w-full h-auto object-cover" />
                    ) : (
                      <video src={editMediaPreview} controls className="w-full h-auto" />
                    )
                  ) : editedMediaUrl ? (
                    getMediaUrl(editedMediaUrl)?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img src={getMediaUrl(editedMediaUrl)} alt="Media" className="w-full h-auto object-cover" />
                    ) : (
                      <video src={getMediaUrl(editedMediaUrl)} controls className="w-full h-auto" />
                    )
                  ) : null}
                  <button
                    type="button"
                    onClick={onRemoveEditMedia}
                    disabled={editLoading}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={onEditClose}
                disabled={editLoading}
                className="px-4 py-2 rounded-full border border-border-dark text-text-white hover:bg-surface-dark transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={onEditSubmit}
                disabled={editLoading || !editedContent.trim()}
                className="px-6 py-2 rounded-full bg-tick text-text-white font-bold hover:bg-tick/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-bg-dark border border-white rounded-2xl p-4 md:p-6 max-w-sm mx-4">
            <h2 className="text-lg md:text-xl font-bold mb-2">
              Supprimer le tweet ?
            </h2>
            <p className="text-text-muted mb-6 text-xs md:text-sm">
              Cette action est irréversible. Le tweet sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onDeleteConfirmClose}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-border-dark rounded-full text-xs md:text-sm hover:bg-surface-dark transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={onDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-error text-text-white rounded-full text-xs md:text-sm hover:bg-error/90 transition disabled:opacity-50"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
