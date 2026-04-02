

import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils.ts";
import Button from "./Button";

// Composant de pied de page réutilisable, avec deux variantes : une version verticale pour le sidebar desktop et une version horizontale pour le mobile, utilisant class-variance-authority pour la gestion des classes CSS conditionnelles


// Footer Data Props - contient la configuration du composant
interface FooterDataProps {
  vertical?: boolean;
}

// Footer View Props - contient les propriétés de présentation
interface FooterViewProps {
  className?: string;
}

export default function Footer({ className = "", vertical = false }: FooterDataProps & FooterViewProps) {
  const navigate = useNavigate();

  if (vertical) {
    // Version pour le sidebar desktop - vertical avec SVG
    return (
      <nav className="space-y-4 flex-1 mb-8">
        <Button
          variant="icons"
          size="md"
          icon={<span className="w-6 h-6 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12L12 3l9 9M9 21V12h6v9" /></svg></span>}
          onClick={() => navigate('/home')}
          className="w-full justify-start"
        >
          Accueil
        </Button>

        <Button
          variant="icons"
          size="md"
          icon={<span className="w-6 h-6 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>}
          className="w-full justify-start"
        >
          Explorer
        </Button>

        <Button
          variant="icons"
          size="md"
          icon={<span className="w-6 h-6 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" /></svg></span>}
          className="w-full justify-start"
        >
          Notifications
        </Button>

        <Button
          variant="icons"
          size="md"
          icon={<span className="w-6 h-6 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>}
          onClick={() => navigate('/profile')}
          className="w-full justify-start"
        >
          Profile
        </Button>

        <Button
          variant="icons"
          size="md"
          icon={<span className="w-6 h-6 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>}
          onClick={() => navigate('/settings')}
          className="w-full justify-start"
        >
          Paramètres
        </Button>
      </nav>
    );
  }

  // Version pour mobile - horizontal
  return (
    <footer className={cn("fixed bottom-0 left-0 right-0 bg-bg-black border-t border-border-dark flex justify-center", className)}>
      <div className="max-w-md flex items-center justify-around gap-4 py-6 px-4 w-full">
        <Button
          variant="icons"
          size="sm"
          icon={<span className="w-6 h-6 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12L12 3l9 9M9 21V12h6v9" /></svg></span>}
          onClick={() => navigate('/home')}
          className="flex flex-col items-center p-2"
        />

        <Button
          variant="icons"
          size="sm"
          icon={<span className="w-6 h-6 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>}
          className="flex flex-col items-center p-2"
        />

        <Button
          variant="icons"
          size="sm"
          icon={<span className="w-6 h-6 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" /></svg></span>}
          className="flex flex-col items-center p-2"
        />

        <Button
          variant="icons"
          size="sm"
          icon={<span className="w-6 h-6 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>}
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center p-2"
        />
      </div>
    </footer>
  );

}

