import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Header from "./ui/Header";
import StrengthBar from "./ui/StrengthBar";
import { register } from "../lib/api";
import { validatePasswordStrength } from "../lib/passwordValidator";

export default function SignupComponent() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = validatePasswordStrength(password);

  const lengthOk = password.length >= 8;
  const upperOk = /[A-Z]/.test(password);
  const lowerOk = /[a-z]/.test(password);
  const digitOk = /\d/.test(password);
  const specialOk = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);



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

    if (!passwordStrength.isValid) {
      setError("Le mot de passe ne respecte pas les critères de sécurité");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await register({ user: username, email, password, name: username });
      if (success) {
        navigate("/login");
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } catch {
      setError("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-black to-surface-dark flex items-center justify-center py-4">
      {/* Mobile phone frame */}
      <div className="w-full max-w-sm bg-bg-black text-text-white rounded-3xl shadow-2xl overflow-hidden border-4 border-surface-dark">
        <div className="overflow-y-auto h-screen max-h-[812px] flex flex-col">
          <Header />

          <div className="flex-1 flex flex-col px-6 py-8">

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
            
            {/* Password input with strength indicator */}
            <div>
              <Input
                name="password"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={setPassword}
              />
              
              {password && (
                <div className="mt-3 space-y-2">
                  {/* Strength bar */}
                  <StrengthBar passwordStrength={passwordStrength} />

                  <div className="bg-surface-dark rounded-lg p-3 space-y-1">
                    <div className={`text-xs flex items-start gap-2 ${lengthOk ? 'text-green' : 'text-text-muted'}`}>
                      <span className={`${lengthOk ? 'text-green' : 'text-error'} mt-0.5`}>{lengthOk ? '✓' : '●'}</span>
                      <span>Minimum 8 caractères</span>
                    </div>
                    <div className={`text-xs flex items-start gap-2 ${upperOk ? 'text-green' : 'text-text-muted'}`}>
                      <span className={`${upperOk ? 'text-green' : 'text-error'} mt-0.5`}>{upperOk ? '✓' : '●'}</span>
                      <span>Au moins une majuscule</span>
                    </div>
                    <div className={`text-xs flex items-start gap-2 ${lowerOk ? 'text-green' : 'text-text-muted'}`}>
                      <span className={`${lowerOk ? 'text-green' : 'text-error'} mt-0.5`}>{lowerOk ? '✓' : '●'}</span>
                      <span>Au moins une minuscule</span>
                    </div>
                    <div className={`text-xs flex items-start gap-2 ${digitOk ? 'text-green' : 'text-text-muted'}`}>
                      <span className={`${digitOk ? 'text-green' : 'text-error'} mt-0.5`}>{digitOk ? '✓' : '●'}</span>
                      <span>Au moins un chiffre</span>
                    </div>
                    <div className={`text-xs flex items-start gap-2 ${specialOk ? 'text-green' : 'text-text-muted'}`}>
                      <span className={`${specialOk ? 'text-green' : 'text-error'} mt-0.5`}>{specialOk ? '✓' : '●'}</span>
                      <span>Au moins un caractère spécial (!@#$...)</span>
                    </div>
                  </div>

                  <div className="text-xs text-green flex items-center gap-2">
                    <span>{passwordStrength.isValid ? '✓' : ''}</span>
                    <span>{passwordStrength.isValid ? 'Mot de passe sécurisé' : ''}</span>
                  </div>
                </div>
              )}
            </div>











            <Input
              name="confirm"
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={setConfirm}
            />

            {error && <p className="text-error text-sm">{error}</p>}

            <Button 
              variant="solid" 
              size="lg" 
              type="submit" 
              disabled={loading || !passwordStrength.isValid}
            >
              {loading ? "Création..." : "Créer un compte"}
            </Button>
          </form>

          <p className="text-xs text-text-muted mt-4">
            En vous inscrivant, vous acceptez les <span className="text-tick">Conditions d'utilisation</span> et la <span className="text-tick">Politique de confidentialité</span>.
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
