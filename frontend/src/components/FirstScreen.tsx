import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Header from "./ui/Header";

export default function FirstScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-black text-text-white flex flex-col">
      <div className="grow flex  justify-center">
        <div className="max-w-md w-full px-6 py-12">
          <Header />

          <h1 className="text-5xl font-extrabold leading-tight mb-4">Ça se passe<br/>maintenant</h1>

          <p className="text-2xl font-bold my-6">Inscrivez-vous.</p>

          <div className="flex flex-col gap-4">
            <Button variant="solid" size="lg" onClick={() => navigate("/signup")} className="w-full">Créer un compte</Button>

            <p className="text-md text-text-muted leading-tight">
              En vous inscrivant, vous acceptez les <span className="text-tick">Conditions d'utilisation</span> et la <span className="text-tick">Politique de confidentialité</span>, notamment l' <span className="text-tick">Utilisation des cookies</span>.
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

      <footer className="border-t border-border-dark pt-6 text-center text-xs text-text-muted">
        <div className="mt-3 pb-6">© 2026 X Corp.</div>
      </footer>
    </div>
  );
}
