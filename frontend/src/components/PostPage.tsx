import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./ui/Header";
import Avatar from "./ui/Avatar";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Footer from "./ui/Footer";

export default function PostPage() {
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const MAX = 280;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const length = content.trim().length;
    if (length === 0) return; // nothing to post
    if (length > MAX) {
      alert(`Votre message dépasse la limite de ${MAX} caractères (${length}).`);
      return;
    }
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-bg-black text-text-white flex flex-col">
      <Header />

      <main className="flex-grow max-w-md mx-auto px-4 pt-6 w-full">
        <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-row justify-between">
          <Button variant="dark" size="sm">Annuler </Button>
          <Button type="submit" variant="post" disabled={content.length === 0 || content.length > MAX}>Post</Button>
        </div>
          <div className="flex items-start gap-3">
            <Avatar variant="mehmet" />
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
