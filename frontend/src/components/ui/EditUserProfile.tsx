import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUser, type User } from "../../lib/api";
import Header from "./Header";
import SideBar from "./SideBar";
import Footer from "./Footer";
import Button from "./Button";

interface EditUserProfileProps {
  user: User | null;
  onSave?: (updatedUser: User) => void;
  onCancel?: () => void;
}

export default function EditUserProfile({ user, onSave: _onSave, onCancel }: EditUserProfileProps) {
  const navigate = useNavigate();
  const [_loading, _setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
              <div className="px-4 md:px-6 py-3 bg-green-900/30 border border-green-500/30 rounded-lg m-4">
                <p className="text-green-400 text-sm md:text-base">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="px-4 md:px-6 py-3 bg-red-900/30 border border-red-500/30 rounded-lg m-4">
                <p className="text-red-400 text-sm md:text-base">{errorMessage}</p>
              </div>
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
              <div>
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
              </div>

              {/* Photo de profil URL */}
              <div>
                <label className="block text-sm font-semibold text-text-white mb-2">
                  URL Photo de profil
                </label>
                <input
                  type="url"
                  name="pp"
                  value={formData.pp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-tick"
                  placeholder="https://exemple.com/photo.jpg"
                  maxLength={1000}
                />
                {formData.pp && (
                  <img
                    src={formData.pp}
                    alt="Preview"
                    className="mt-3 w-20 h-20 rounded-full object-cover border border-border-dark"
                    onError={() => {}}
                  />
                )}
              </div>

              {/* Banner URL */}
              <div>
                <label className="block text-sm font-semibold text-text-white mb-2">
                  URL Bannière
                </label>
                <input
                  type="url"
                  name="banner"
                  value={formData.banner}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-tick"
                  placeholder="https://exemple.com/banniere.jpg"
                  maxLength={1000}
                />
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
