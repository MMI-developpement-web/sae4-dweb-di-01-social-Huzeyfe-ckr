import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Header from "./ui/Header";

export default function FirstScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-grow flex  justify-center">
        <div className="max-w-md w-full px-6 py-12">
          <Header />

          <h1 className="text-5xl font-extrabold leading-tight mb-4">Ça se passe<br/>maintenant</h1>

          <p className="text-2xl font-bold my-6">Inscrivez-vous.</p>

          <div className="flex flex-col gap-4">
            <Button variant="solid" size="lg" onClick={() => navigate("/signup")} className="w-full">Créer un compte</Button>

            <p className="text-md text-gray-300 leading-tight">
              En vous inscrivant, vous acceptez les <span className="text-sky-400">Conditions d'utilisation</span> et la <span className="text-sky-400">Politique de confidentialité</span>, notamment l' <span className="text-sky-400">Utilisation des cookies</span>.
            </p>

            <div className="mt-16">
              <p className="font-extrabold mb-6">Vous avez déjà un compte ?</p>
              <Button
                onClick={() => navigate("/login")}
                variant="dark"
                size="gg"
                className="w-full"
              >
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        <div className="mt-3 pb-6">© 2026 X Corp.</div>
      </footer>
    </div>
  );
}
