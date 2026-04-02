import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUser, uploadMedia, getMediaUrl, BACKEND_ORIGIN, type User } from "../../lib/api";
import Header from "./Header";
import SideBar from "./SideBar";
import Footer from "./Footer";
import Button from "./Button";


// Composant de formulaire pour éditer les informations du profil utilisateur, y compris le téléchargement d'avatar et de bannière, avec gestion des états de chargement et des messages de succès/erreur

// EditUserProfile Data Props - contient les données utilisateur
interface EditUserProfileDataProps {
  user: User | null;
}

// EditUserProfile View Props - contient les callbacks
interface EditUserProfileViewProps {
  onSave?: (updatedUser: User) => void;
  onCancel?: () => void;
}

export default function EditUserProfile({ user, onSave: _onSave, onCancel }: EditUserProfileDataProps & EditUserProfileViewProps) {
  const navigate = useNavigate();
  const [_loading, _setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // File upload states
  const [ppFile, setPpFile] = useState<File | null>(null);
  const [ppPreview, setPpPreview] = useState<string | null>(null);
  const [ppUploading, setPpUploading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    location: user?.location || "",
    website: user?.website || "",
    pp: user?.pp || "",
    banner: user?.banner || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle avatar file selection
  const handlePpFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPpFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPpPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner file selection
  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload avatar
  const handlePpUpload = async () => {
    if (!ppFile) return;
    setPpUploading(true);
    try {
      const result = await uploadMedia(ppFile);
      if (result.mediaUrl) {
        // Convert relative URL to absolute URL with backend origin
        const fullUrl = result.mediaUrl.startsWith('http') 
          ? result.mediaUrl 
          : `${BACKEND_ORIGIN}${result.mediaUrl}`;
        setFormData((prev) => ({
          ...prev,
          pp: fullUrl,
        }));
        setPpFile(null);
        setPpPreview(null);
      } else {
        setErrorMessage(result.error || "Erreur lors du téléchargement de l'avatar");
      }
    } catch (error) {
      setErrorMessage("Erreur lors du téléchargement de l'avatar");
    } finally {
      setPpUploading(false);
    }
  };

  // Upload banner
  const handleBannerUpload = async () => {
    if (!bannerFile) return;
    setBannerUploading(true);
    try {
      const result = await uploadMedia(bannerFile);
      if (result.mediaUrl) {
        // Convert relative URL to absolute URL with backend origin
        const fullUrl = result.mediaUrl.startsWith('http') 
          ? result.mediaUrl 
          : `${BACKEND_ORIGIN}${result.mediaUrl}`;
        setFormData((prev) => ({
          ...prev,
          banner: fullUrl,
        }));
        setBannerFile(null);
        setBannerPreview(null);
      } else {
        setErrorMessage(result.error || "Erreur lors du téléchargement de la bannière");
      }
    } catch (error) {
      setErrorMessage("Erreur lors du téléchargement de la bannière");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const success = await updateUser(user.id, {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        pp: formData.pp,
        banner: formData.banner,
      });

      if (success) {
        setSuccessMessage("✓ Profil mis à jour avec succès !");
        setTimeout(() => {
          onCancel?.();
          navigate(`/profile/${user.id}`);
        }, 1500);
      } else {
        setErrorMessage("Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-bg-black min-h-screen text-text-white flex flex-col md:flex-row">
      <SideBar />
      <Header showLogout={true} />

      <main className="flex-1 md:ml-72 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl border-r border-border-dark md:border-l md:border-border-dark pb-24 md:pb-0">
          
          {/* Header */}
          <div className="sticky top-0 z-10 bg-bg-black/80 backdrop-blur border-b border-border-dark px-4 md:px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold">Éditer mon profil</h1>
            <button
              onClick={onCancel}
              className="text-text-muted hover:text-text-white transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="divide-y divide-border-dark">
            {/* Success Message */}
            {successMessage && (
              <output 
                className="block px-4 md:px-6 py-3 rounded-lg m-4 border-l-4 text-sm md:text-base"
                role="status"
                aria-live="polite"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, var(--color-bg-black) 90%)',
                  borderLeftColor: 'var(--color-success)',
                  color: 'var(--color-success)'
                }}
              >
                {successMessage}
              </output>
            )}

            {/* Error Message */}
            {errorMessage && (
              <output 
                className="block px-4 md:px-6 py-3 rounded-lg m-4 border-l-4 text-sm md:text-base"
                role="alert"
                aria-live="polite"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-error) 10%, var(--color-bg-black) 90%)',
                  borderLeftColor: 'var(--color-error)',
                  color: 'var(--color-error)'
                }}
              >
                {errorMessage}
              </output>
            )}

            {/* Form Fields */}
            <div className="px-4 md:px-6 py-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-text-white mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-tick"
                  placeholder="Votre nom complet"
                  maxLength={255}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-text-white mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-tick resize-vertical"
                  placeholder="Parlez-nous de vous..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-text-muted text-xs mt-1">
                  {formData.bio.length}/500 caractères
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-text-white mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-tick"
                  placeholder="Ex: Paris, France"
                  maxLength={255}
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-text-white mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-tick"
                  placeholder="https://exemple.com"
                  maxLength={255}
                />
              </div>

              {/* Phone */}
              {/* <div>
                <label className="block text-sm font-semibold text-text-white mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-tick"
                  placeholder="+33 6 12 34 56 78"
                  maxLength={20}
                />
              </div> */}

              {/* Photo de profil */}
              <div>
                <label className="block text-sm font-semibold text-text-white mb-2">
                  Photo de profil
                </label>
                
                {/* File input button - always visible if no file selected */}
                {!ppFile && !ppPreview && (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handlePpFileSelect}
                      className="hidden"
                    />
                    <span className="block w-full px-4 py-3 bg-tick hover:bg-tick/90 text-text-white rounded-lg text-center font-semibold transition">
                      📁 Choisir une photo
                    </span>
                  </label>
                )}

                {/* Preview and upload - shown when file selected */}
                {ppPreview && (
                  <div className="space-y-3">
                    <img
                      src={ppPreview}
                      alt="Avatar preview"
                      className="w-32 h-32 rounded-full object-cover border-2 border-tick mx-auto"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handlePpUpload}
                        disabled={ppUploading}
                        className="flex-1 px-4 py-2 bg-tick hover:bg-tick/90 disabled:opacity-50 text-text-white rounded-lg font-semibold transition"
                      >
                        {ppUploading ? "Envoi..." : "Envoyer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPpFile(null);
                          setPpPreview(null);
                        }}
                        className="px-4 py-2 bg-error hover:bg-error/90 text-text-white rounded-lg font-semibold transition"
                      >
                        ✕ Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Current avatar display */}
                {formData.pp && !ppPreview && (
                  <div className="space-y-2">
                    <p className="text-text-muted text-xs">Avatar actuel:</p>
                    <img
                      src={getMediaUrl(formData.pp)}
                      alt="Current avatar"
                      className="w-32 h-32 rounded-full object-cover border border-border-dark"
                      onError={() => {}}
                    />
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePpFileSelect}
                        className="hidden"
                      />
                      <span className="block w-full px-4 py-2 bg-tick hover:bg-tick/90 text-text-white rounded-lg text-center font-semibold transition text-sm">
                        📁 Changer
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Banner */}
              <div>
                <label className="block text-sm font-semibold text-text-white mb-2">
                  Bannière
                </label>
                
                {/* File input button - always visible if no file selected */}
                {!bannerFile && !bannerPreview && (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleBannerFileSelect}
                      className="hidden"
                    />
                    <span className="block w-full px-4 py-3 bg-tick hover:bg-tick/90 text-text-white rounded-lg text-center font-semibold transition">
                      📁 Choisir une bannière
                    </span>
                  </label>
                )}

                {/* Preview and upload - shown when file selected */}
                {bannerPreview && (
                  <div className="space-y-3">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-40 rounded-lg object-cover border-2 border-tick"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleBannerUpload}
                        disabled={bannerUploading}
                        className="flex-1 px-4 py-2 bg-tick hover:bg-tick/90 disabled:opacity-50 text-text-white rounded-lg font-semibold transition"
                      >
                        {bannerUploading ? "Envoi..." : "Envoyer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBannerFile(null);
                          setBannerPreview(null);
                        }}
                        className="px-4 py-2 bg-error hover:bg-error/90 text-text-white rounded-lg font-semibold transition"
                      >
                        ✕ Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Current banner display */}
                {formData.banner && !bannerPreview && (
                  <div className="space-y-2">
                    <p className="text-text-muted text-xs">Bannière actuelle:</p>
                    <img
                      src={getMediaUrl(formData.banner)}
                      alt="Current banner"
                      className="w-full h-40 rounded-lg object-cover border border-border-dark"
                      onError={() => {}}
                    />
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleBannerFileSelect}
                        className="hidden"
                      />
                      <span className="block w-full px-4 py-2 bg-tick hover:bg-tick/90 text-text-white rounded-lg text-center font-semibold transition text-sm">
                        📁 Changer
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="px-4 md:px-6 py-6 flex gap-3 justify-end">
              <Button
                onClick={onCancel}
                variant="dark"
                size="sm"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                size="sm"
                className="bg-tick hover:bg-tick/90"
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Mobile */}
      <Footer className="md:hidden" />
    </div>
  );
}
