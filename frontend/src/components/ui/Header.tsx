import { cn } from "../../lib/utils.ts";
import { useNavigate } from "react-router-dom";
import { logout } from "../../lib/api";
import Button from "./Button";


// Composant de header réutilisable avec logo centré et bouton de déconnexion optionnel, adapté pour les vues mobiles, utilisant class-variance-authority pour la gestion des classes CSS conditionnelles

interface HeaderDataProps {
  logoSrc?: string;
  showLogout?: boolean;
};

interface HeaderViewProps {className?: string; }

export default function Header({ showLogout = false, className = "" }: HeaderDataProps & HeaderViewProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    alert('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <header className={cn("w-full relative flex items-center justify-between py-3 px-6 md:hidden", className)}>
      {/* Empty space (left) */}
      <div className="w-10"></div>

      {/* Logo (center) */}
      <span 
        className="text-5xl font-black text-text-white absolute left-1/2 -translate-x-1/2 cursor-pointer hover:opacity-80 transition"
        onClick={() => navigate('/home')}
      >
        𝕏
      </span>

      {/* Logout Button (right) - only on mobile */}
      {showLogout && (
        <Button 
          variant="solid" 
          size="md" 
          className="bg-error hover:bg-red/90 text-white font-bold"
          onClick={handleLogout}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2m14-4V7a2 2 0 00-2-2h-6a2 2 0 00-2 2v2" />
          </svg>
        </Button>
      )}
      {!showLogout && <div className="w-10"></div>}
    </header>
  );
}
 