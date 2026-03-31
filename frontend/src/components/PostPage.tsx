import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./ui/Header";
import SideBar from "./ui/SideBar";
import Avatar from "./ui/Avatar";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Footer from "./ui/Footer";
import { createPost, getCurrentUser, uploadMedia, getMediaUrl } from "../lib/api";

export default function PostPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const navigate = useNavigate();

  const MAX = 280;

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileType(file.type);
      setError("");
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload  media
  const handleMediaUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError("");
    try {
      const result = await uploadMedia(selectedFile);
      if (result.mediaUrl) {
        setMediaUrl(result.mediaUrl);
        setSelectedFile(null);
        // Keep previewUrl and fileType for display
      } else {
        setError(result.error || "Erreur lors du téléchargement");
      }
    } catch (err) {
      setError("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  // Remove media
  const handleRemoveMedia = () => {
    setMediaUrl(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType(null);
  };

  // Check if user is authenticated
  const currentUser = getCurrentUser();
  if (!currentUser) {
    navigate('/login');
    return (
      <div className="min-h-screen bg-bg-black flex items-center justify-center">
        <p className="text-text-white">Redirection vers la connexion...</p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const length = content.trim().length;
    if (length === 0) return; // nothing to post
    if (length > MAX) {
      alert(`Votre message dépasse la limite de ${MAX} caractères (${length}).`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError("Vous mustn'être connecté pour poster");
        setLoading(false);
        navigate("/login");
        return;
      }

      const now = new Date().toISOString();
      const success = await createPost(currentUser.id, content, now, mediaUrl || undefined);

      if (success) {
        navigate("/home");
      } else {
        setError("Erreur lors de la création du post");
        setLoading(false);
      }
    } catch (err) {
      setError("Erreur lors de la création du post");
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-black min-h-screen text-text-white flex flex-col">
      {/* Desktop: Sidebar */}
      <SideBar />

      {/* Header Mobile */}
      <Header/>

      <main className="flex-1 md:ml-72 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl border-r border-border-dark md:border-l md:border-border-dark pt-4 md:pt-6 pb-24 md:pb-0">
          <form onSubmit={submit} className="px-4 md:px-6 space-y-4">
            <div className="flex flex-row justify-between gap-2">
              <Button variant="dark" size="sm" onClick={() => navigate("/home")}>Annuler</Button>
              <Button type="submit" variant="post" disabled={content.length === 0 || content.length > MAX || loading}>
                {loading ? "Publication..." : "Post"}
              </Button>
            </div>
            
            {error && <p className="text-error text-xs md:text-sm">{error}</p>}
            
            <div className="flex items-start gap-2 md:gap-3">
              {(() => {
                const current = getCurrentUser();
                const rawPp = current?.pp;
                const username = current?.username ?? current?.user ?? "guest";
                const avatarSrc = rawPp && rawPp !== "null" ? getMediaUrl(rawPp) : current ? `https://picsum.photos/seed/${encodeURIComponent(username)}/200` : undefined;
                const initials = current?.name?.charAt(0)?.toUpperCase() ?? "U";
                return (
                  <Avatar size="md" src={avatarSrc} alt={`${current?.name ?? "Utilisateur"} avatar`}>
                    <div className="flex items-center justify-center w-full h-full text-xs md:text-sm font-bold text-text-white">{initials}</div>
                  </Avatar>
                );
              })()}
              <div className="flex-1">
                <Input
                  variant="textarea"
                  value={content}
                  onChange={setContent}
                  placeholder="Quoi de neuf ?"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
                    onChange={handleFileSelect}
                    disabled={uploading || !!mediaUrl}
                    className="hidden"
                  />
                  <span className="text-tick hover:text-tick/80 disabled:opacity-50 text-sm md:text-base cursor-pointer inline-block">
                    📎 Ajouter média
                  </span>
                </label>
      
                {selectedFile && !mediaUrl && (
                  <Button
                    onClick={handleMediaUpload}
                    disabled={uploading}
                    variant="post"
                    size="sm"
                  >
                    {uploading ? "Envoi..." : "Envoyer"}
                  </Button>
                )}
              </div>

              <p className={`text-xs md:text-sm ${content.length > MAX ? "text-error" : "text-text-muted"}`}>
                {MAX - content.length}
              </p>
            </div>

            {/* Media preview */}
            {(previewUrl || mediaUrl) && (
              <div className="relative bg-surface-dark rounded-lg overflow-hidden">
                {previewUrl && (
                  <div className="relative">
                    {fileType?.startsWith('image/') ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-96 object-cover" />
                    ) : (
                      <video src={previewUrl} controls className="w-full h-auto max-h-96" />
                    )}
                  </div>
                )}
                {mediaUrl && !previewUrl && (
                  <div className="relative">
                    {getMediaUrl(mediaUrl)?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img src={getMediaUrl(mediaUrl)} alt="Uploaded" className="w-full h-auto max-h-96 object-cover" />
                    ) : (
                      <video src={getMediaUrl(mediaUrl)} controls className="w-full h-auto max-h-96" />
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}

            {selectedFile && !mediaUrl && (
              <p className="text-text-muted text-xs md:text-sm">
                Fichier sélectionné: {selectedFile.name}
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <div></div>
              {content.length > MAX && (
                <p className="text-error text-xs md:text-sm">Limite dépassée de {content.length - MAX} caractères</p>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Footer Mobile */}
      <Footer className="md:hidden" />
    </div>
  );
}
