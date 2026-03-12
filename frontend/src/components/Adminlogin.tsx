import Input from './ui/Input'
import Button from './ui/Button'
import Header from './ui/Header'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { login, saveCurrentUser } from '../lib/api'

export default function AdminLogin() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Veuillez remplir l'identifiant et le mot de passe");
      return;
    }

    setLoading(true);
    setError("");

    const loggedInUser = await login(username, password);

    if (loggedInUser && loggedInUser.role === 'admin') {
      saveCurrentUser(loggedInUser);
      navigate('/adminmanagement');
    } else if (loggedInUser) {
      setError("Accès administrateur refusé");
    } else {
      setError("Identifiant ou mot de passe incorrect");
    }

    setLoading(false);
  };
  

  return (
    <div className="bg-bg-black min-h-screen flex flex-col items-center py-8 px-6 text-text-white">
      <Header />

      <main className="w-full max-w-sm flex-1 flex flex-col items-center">
        <h1 className="flex text-5xl font-extrabold leading-tight mb-2">Administration</h1>

        <form className="mt-20" onSubmit={submit}>
          <div className="space-y-8">
            <Input
              variant="default"
              type="text"
              placeholder="Identifiant"
              className='py-5'
              value={username}
              onChange={setUsername}
            />
            <Input
              variant="default"
              type="password"
              placeholder="Mot de passe"
              className='py-5'
              value={password}
              onChange={setPassword}
            />
          </div>
          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <div className="flex justify-center w-full mt-4">
            <Button type="submit" variant="solid" size="gg" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
