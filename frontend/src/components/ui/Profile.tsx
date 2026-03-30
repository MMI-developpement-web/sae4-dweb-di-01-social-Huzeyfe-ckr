
import Avatar from "./Avatar";
import { getCurrentUser, getMediaUrl } from "../../lib/api";
import type { User } from "../../lib/api";
import { useNavigate } from "react-router-dom";

// Composant de profil utilisateur affichant l'avatar, le nom et le handle, avec redirection vers la page de profil au clic, et gestion des valeurs par défaut pour les utilisateurs non connect


export interface ProfileProps {
  // optional override props in case caller wants to force values
  name?: string;
  handle?: string;
  image?: string;
}

export default function Profile({ name: propName, handle: propHandle, image: propImage }: ProfileProps) {
  const navigate = useNavigate();
  const current = getCurrentUser() as User | null;

  const name = propName ?? current?.name ?? "Invité";
  // Handle both 'user' and 'username' fields from API
  const handle = propHandle ?? current?.username ?? current?.user ?? "guest";

  const rawPp = current?.pp || undefined;
  const avatarSrc = propImage ?? (rawPp && rawPp !== "null" ? getMediaUrl(rawPp) : `https://picsum.photos/seed/${encodeURIComponent(String(handle))}/200`);

  // Ensure handle is a string and get first character
  const handleStr = typeof handle === 'string' ? handle : String(handle);
  const initials = handleStr?.charAt(0).toUpperCase() ?? "U";

  const handleClick = () => {
    navigate('/profile');
  };









  return (
    <article className="bg-black p-4 hover:bg-surface-dark transition cursor-pointer" onClick={handleClick}> 
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <Avatar size="md" src={avatarSrc} alt={`${name} avatar`}>
            <div className="flex items-center justify-center w-full h-full text-sm font-bold text-text-white">{initials}</div>
          </Avatar>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white text-xl">{name}</span>
            <div className="ml-2 flex items-center gap-1 text-gray-500 text-lg">
              <span>@{handleStr}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}