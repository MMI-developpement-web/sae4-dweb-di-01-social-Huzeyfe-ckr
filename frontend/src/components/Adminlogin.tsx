import Input from './ui/Input'
import Button from './ui/Button'
import Header from './ui/Header'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function AdminLogin() {

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
    <div className="bg-bg-black min-h-screen flex flex-col items-center py-8 px-6 text-text-white">
        <Header />

      <main className="w-full max-w-sm flex-1 flex flex-col items-center">
        <h1 className="flex text-5xl font-extrabold leading-tight mb-2">Administration</h1>

        <form className="mt-20" onSubmit={submit}>
          <div className="space-y-8">
            <Input variant="default" type="email" placeholder="Email" className='py-5' value={email} onChange={setEmail} />
            <Input variant="default" type="password" placeholder="Mot de passe" className='py-5' value={password} onChange={setPassword} />
          </div>
          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <div className="flex justify-center w-full  mt-4">
            <Button type="submit" variant="solid" size="gg">
              Se connecter
            </Button>
          </div>
          <p className="flex flex-row text-text-muted">email: admin@123 mdp:admin123</p>
        </form>  
      </main>
    </div>
  );
}
