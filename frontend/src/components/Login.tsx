import Input from './ui/Input'
import Button from './ui/Button'
import Header from './ui/Header'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { login, saveCurrentUser } from '../lib/api'

export default function Login() {

  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !password){ 
      setError("Veuillez remplir l'identifiant et le mot de passe");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const loggedInUser = await login(user, password);
    
    if (loggedInUser) {
      saveCurrentUser(loggedInUser);
      // Rediriger selon le rôle
      if (loggedInUser.role === 'admin') {
        navigate('/adminmanagement');
      } else {
        navigate('/home');
      }
    } else {
      setError("Identifiant ou mot de passe incorrect");
    }
    
    setLoading(false);
  };
  



  return (
    <div className="bg-bg-black min-h-screen flex flex-col items-center py-8 px-6 text-text-white">
        <Header />

      <main className="w-full max-w-sm flex-1 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold leading-tight text-left w-full mb-2">Ça se passe maintenant</h1>
        <h2 className="text-2xl font-black w-full m-16">Connectez-vous.</h2>

        <form className="w-full" onSubmit={submit}>
          <div className="space-y-4">
            <Input variant="default" type="text" placeholder="Identifiant" value={user} onChange={setUser} />
            <Input variant="default" type="password" placeholder="Mot de passe" value={password} onChange={setPassword} />
          </div>
          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <div className="flex justify-center w-full  mt-4">
            <Button type="submit" variant="solid" size="gg" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </div>

          <div className="text-center mt-3">
            <a className="text-tick text-md">Mot de passe oublié ?</a>
          </div>

          <p className="mt-6 text-text-muted text-md text-center">Vous n'avez pas de compte ? <a className="text-tick">Inscrivez-vous</a></p>
        </form>
      </main>

      <footer className="w-full max-w-sm mt-8 text-center text-text-muted text-xs">
        <div className="border-t border-border-dark pt-4">
          <p>© 2026 X Corp.</p>
        </div>
      </footer>

    </div>
  );
}
