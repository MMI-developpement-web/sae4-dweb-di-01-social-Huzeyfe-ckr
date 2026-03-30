import Avatar from "./Avatar";
import Button from "./Button";
import editIcon from "../../assets/edit.svg";
import type { User } from "../../lib/api";
import { getMediaUrl } from "../../lib/api";

// Composant de compte utilisateur affichant les informations de base et un bouton pour modifier le profil

interface AccountProps {
  user: User;
  onModify: (user: User) => void;
}

export default function Account({ user, onModify }: AccountProps) {
  const rawPp = user.pp;
  const username = user.username ?? user.user ?? "guest";
  const avatarSrc = rawPp && rawPp !== "null" ? getMediaUrl(rawPp) : `https://picsum.photos/seed/${encodeURIComponent(username)}/200`;
  const initials = user.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl p-4">
      <div className="flex items-start gap-4">
        <Avatar size="md" src={avatarSrc} alt={`${user.name} avatar`}>
          <div className="flex items-center justify-center w-full h-full text-sm font-bold text-text-white">
            {initials}
          </div>
        </Avatar>
        <div className="flex-1">
          <div className="font-bold text-lg">{user.name}</div>
          <div className="text-sm text-text-muted mb-3">{user.email}</div>

          <div className="grid grid-cols-2 gap-4 text-sm text-text-muted mb-4">
            <div>
              <div className="text-[11px] text-text-muted">Téléphone</div>
              <div className="text-text-white">+33 6 12 34 56 78</div>
            </div>
            <div>
              <div className="text-[11px] text-text-muted">Date de naissance</div>
              <div className="text-text-white">15/03/1990</div>
            </div>
            <div>
              <div className="text-[11px] text-text-muted">Créé le</div>
              <div className="text-text-white">15/01/2026</div>
            </div>
            <div />
          </div>

          <div>
            <Button
              variant="dark"
              size="md"
              className="w-full rounded-full border border-border-dark"
              icon={<img src={editIcon} alt="éditer" className="w-4 h-4" />}
              iconPosition="left"
              onClick={() => onModify(user)}
            >
              Modifier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}