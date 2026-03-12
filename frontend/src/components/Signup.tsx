import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Header from "./ui/Header";
import { register } from "../lib/api";

export default function SignupComponent() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !username || !password || !confirm) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await register({ user: username, email, password, name: username });
      if (success) {
        // Redirect to login after successful registration
        navigate("/login");
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-black text-text-white flex flex-col">
      <div className="grow flex justify-center">
        <div className="max-w-md w-full px-6 py-12">
          <Header />

          <h1 className="text-4xl font-extrabold mb-12">Créez votre compte</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
            />
            <Input
              name="username"
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={setUsername}
            />
            <Input
              name="password"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={setPassword}
            />
            <Input
              name="confirm"
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={setConfirm}
            />

            {error && <p className="text-error text-sm">{error}</p>}

            <Button variant="solid" size="lg" type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer un compte"}
            </Button>
          </form>

          <p className="text-xs text-text-muted mt-4">
            En vous inscrivant, vous acceptez les <span className="text-tick">Conditions d'utilisation</span> et la <span className="text-tick">Politique de confidentialité</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
