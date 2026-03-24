import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./ui/Header";
import SideBar from "./ui/SideBar";
import Avatar from "./ui/Avatar";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Footer from "./ui/Footer";
import { createPost, getCurrentUser } from "../lib/api";

export default function PostPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const MAX = 280;

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
      const success = await createPost(currentUser.id, content, now);

      if (success) {
        navigate("/home");
      } else {
        setError("Erreur lors de la création du post");
      }
    } catch (err) {
      setError("Erreur lors de la création du post");
    } finally {
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
                const avatarSrc = rawPp && rawPp !== "null" ? rawPp : current ? `https://picsum.photos/seed/${encodeURIComponent(username)}/200` : undefined;
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
              <p className={`text-xs md:text-sm ${content.length > MAX ? "text-error" : "text-text-muted"}`}>
                {MAX - content.length}
              </p>
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
