import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./ui/Header";
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
    <div className="min-h-screen bg-bg-black text-text-white flex flex-col">
      <Header />

      <main className="grow max-w-md mx-auto px-4 pt-6 w-full">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-row justify-between">
            <Button variant="dark" size="sm" onClick={() => navigate("/home")}>Annuler</Button>
            <Button type="submit" variant="post" disabled={content.length === 0 || content.length > MAX || loading}>
              {loading ? "Publication..." : "Post"}
            </Button>
          </div>
          
          {error && <p className="text-error text-sm">{error}</p>}
          
          <div className="flex items-start gap-3">
            {(() => {
              const current = getCurrentUser();
              const rawPp = current?.pp;
              const username = current?.username ?? current?.user ?? "guest";
              const avatarSrc = rawPp && rawPp !== "null" ? rawPp : current ? `https://picsum.photos/seed/${encodeURIComponent(username)}/200` : undefined;
              const initials = current?.name?.charAt(0)?.toUpperCase() ?? "U";
              return (
                <Avatar size="md" src={avatarSrc} alt={`${current?.name ?? "Utilisateur"} avatar`}>
                  <div className="flex items-center justify-center w-full h-full text-sm font-bold text-text-white">{initials}</div>
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

          <div className="flex items-center justify-between">
            <p className={`text-sm ${content.length > MAX ? "text-error" : "text-text-muted"}`}>
              {MAX - content.length}
            </p>
            {content.length > MAX && (
              <p className="text-error text-sm">Limite dépassée de {content.length - MAX} caractères</p>
            )}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
