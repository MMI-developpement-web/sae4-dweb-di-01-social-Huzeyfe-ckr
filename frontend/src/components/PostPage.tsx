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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-grow max-w-md mx-auto px-4 pt-6 w-full">
        <form  onSubmit={submit} className="space-y-4">
        <div  className="flex flex-row  ">
            <Button  variant="dark" size="sm">Annuler </Button>
            <Button onSubmit={submit} className="">Post</Button>
        </div>
          <div className="flex items-start gap-3">
            <Avatar variant="mehmet" />
            <div className="flex-1">
              <label htmlFor="post-content" className="sr-only">Quoi de neuf ?</label>
              <textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Quoi de neuf ?"
                className="w-full rounded border border-gray-700 bg-transparent p-3 text-white placeholder-gray-500 min-h-[120px] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">140</div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
