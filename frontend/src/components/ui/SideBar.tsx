import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Footer from './Footer'
import { getUser, getCurrentUser, getAuthToken, saveCurrentUser, logout, getMediaUrl } from "../../lib/api";
import Button from "./Button";
import Avatar from "./Avatar";

import { cn } from "../../lib/utils.ts";

interface SideBarDataProps {
  logoSrc?: string;
  alt?: string;
};

interface SideBarViewProps {
  className?: string;
}

export default function SideBar({ className = "" }: SideBarDataProps & SideBarViewProps) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const authToken = getAuthToken();

  // Check if we have auth token - if not, redirect to login
  useEffect(() => {
    if (!currentUser || !authToken) {
      console.warn('SideBar: Missing authentication. Redirecting to login');
      logout();
      navigate('/login');
      return;
    }
  }, [authToken, currentUser, navigate]);

  // Rafraîchir les données utilisateur
  useEffect(() => {
    if (!currentUser?.id || !authToken) return;
    
    const refreshCurrentUser = async () => {
      const current = getCurrentUser();
      if (current?.id) {
        const updated = await getUser(current.id);
        if (updated) {
          saveCurrentUser(updated);
        }
      }
    };
    refreshCurrentUser();
  }, [authToken]);


  const getAvatarUrl = () => {
    if (currentUser?.pp && currentUser.pp !== "null" && currentUser.pp !== "" && currentUser.pp !== null) {
      return getMediaUrl(currentUser.pp);
    }
    return `https://picsum.photos/seed/${encodeURIComponent(currentUser?.user || "default")}/200`;
  };

  const handleLogout = () => {
    logout();
    alert('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <aside className={cn("hidden md:flex md:flex-col md:w-72 md:border-r md:border-border-dark md:p-6 md:fixed md:h-screen md:left-0 md:top-0 md:overflow-y-auto", className)}>

     
      <Footer vertical={true} />

      

      {/* Publish Button */}
      <Button 
        variant="solid" 
        size="lg" 
        className="w-full bg-tick hover:bg-tick/90 text-white font-bold mb-6"
        onClick={() => navigate('/post')}
      >
        Publier
      </Button>

 

    {/* log Out Button */}
      <Button 
        variant="solid" 
        size="lg" 
        className="w-full bg-error hover:bg-red/90 text-white font-bold mb-6"
        onClick={handleLogout}
      >
        <svg>
          <path d="M16 13v-2H7V8l-5 4 5 4v-3zM12 3h8a2 2 0 012 2v14a2 2 0 01-2 2h-8a2 2 0 01-2-2v-4h2v4h8V5h-8v4H10V5a2 2 0 012-2z" fill="currentColor" />
        </svg>

        Déconnection
      </Button>

    
      {currentUser && (
        <div 
          className="border-t border-border-dark pt-4 flex items-center gap-3 p-3 rounded-full hover:bg-surface-dark transition cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <Avatar size="md" src={getAvatarUrl()} alt={currentUser.name}>
            <div className="text-sm font-bold">{currentUser.name?.charAt(0) || 'U'}</div>
          </Avatar>
          <div className="flex flex-col flex-1">
            <div className="font-bold text-sm">{currentUser.name}</div>
            <div className="text-text-muted text-md">@{currentUser.username || currentUser.user}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
