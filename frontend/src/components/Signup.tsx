import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Header from "./ui/Header";

export default function SignupComponent() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder: normalement appel API
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-grow flex  justify-center">
        <div className="max-w-md w-full px-6 py-12">
          <Header />

          <h1 className="text-4xl font-extrabold mb-12">Créez votre compte</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input  name="email" placeholder="Email" />
            <Input  name="name" type="email" placeholder="Nom d'utilisateur" />
            <Input  name="password" type="password" placeholder="Mot de passe" />
            <Input  name="confirm" type="password" placeholder="Confirmer le mot de passe" />

            <Button variant="solid" size="lg" >Créer un compte</Button>
          </form>

          <p className="text-xs text-gray-400 mt-4">
            En vous inscrivant, vous acceptez les <span className="text-sky-400">Conditions d'utilisation</span> et la <span className="text-sky-400">Politique de confidentialité</span>.
          </p>
        </div>
      </div>

    </div>
  );
}
