import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";

interface PostHeaderDataProps {
  name: string;
  handle: string;
  avatar?: string;
  time: string;
  userId?: number;
  userBlocked?: boolean;
  isPinned?: boolean;
}

interface PostHeaderViewProps {}

export function PostHeader({
  name,
  handle,
  avatar,
  time,
  userId,
  userBlocked = false,
  isPinned = false,
}: PostHeaderDataProps & PostHeaderViewProps) {
  const navigate = useNavigate();
  const handleStr = typeof handle === "string" ? handle : String(handle);
  const initials =
    handleStr?.charAt(1)?.toUpperCase() ??
    handleStr?.charAt(0)?.toUpperCase() ??
    "U";

  return (
    <div className="flex items-start gap-2 md:gap-3">
      <button
        onClick={() => userId && navigate(`/profile/${userId}`)}
        className="hover:opacity-80 transition shrink-0"
        aria-label={`View ${name}'s profile`}
      >
        <div className={userBlocked ? "grayscale opacity-75" : ""}>
          <Avatar size="md" src={avatar} alt={`${name} avatar`}>
            <div className="flex items-center justify-center w-full h-full text-xs md:text-sm font-bold text-text-white">
              {initials}
            </div>
          </Avatar>
        </div>
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-bold text-text-white text-sm md:text-base truncate">
            {userBlocked ? "Utilisateur banni" : name}
          </span>
          <span className="text-text-muted text-xs md:text-sm shrink-0">
            {userBlocked ? "" : handleStr}
          </span>
          {isPinned && (
            <span className="text-yellow-500 text-sm md:text-base" title="Tweet épinglé">
              📌
            </span>
          )}
        </div>
        <span className="text-text-muted text-xs md:text-sm">{time}</span>
      </div>
    </div>
  );
}
