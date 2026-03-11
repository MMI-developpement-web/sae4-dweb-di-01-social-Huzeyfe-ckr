import Input from './ui/Input'
import Button from './ui/Button'
import Header from './ui/Header'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password){ 
      setError("Veuillez remplir l'email et le mot de passe");
      return;
    }
    setError("");
    navigate('/home');
  };
  



  return (
    <div className="bg-black min-h-screen flex flex-col items-center py-8 px-6 text-white">
        <Header />

      <main className="w-full max-w-sm flex-1 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold leading-tight text-left w-full mb-2">Ça se passe maintenant</h1>
        <h2 className="text-2xl font-black w-full m-16">Connectez-vous.</h2>

        <form className="w-full" onSubmit={submit}>
          <div className="space-y-4">
            <Input variant="default" type="email" placeholder="Email" value={email} onChange={setEmail} />
            <Input variant="default" type="password" placeholder="Mot de passe" value={password} onChange={setPassword} />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="flex justify-center w-full  mt-4">
            <Button type="submit" variant="solid" size="gg">
              Se connecter
            </Button>
          </div>

          <div className="text-center mt-3">
            <a className="text-[#6bc9fb] text-md">Mot de passe oublié ?</a>
          </div>

          <p className="mt-6 text-gray-400 text-md text-center">Vous n'avez pas de compte ? <a className="text-[#6bc9fb]">Inscrivez-vous</a></p>
        </form>
      </main>

      <footer className="w-full max-w-sm mt-8 text-center text-gray-500 text-xs">
        <div className="border-t border-gray-700 pt-4">
          <p>© 2026 X Corp.</p>
        </div>
      </footer>
    </div>
  );
}
