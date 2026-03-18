
import Avatar from "./Avatar";

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateString;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mois`;
  const years = Math.floor(months / 12);
  return `${years}an${years > 1 ? 's' : ''}`;
}

export interface PostProps {
  id?: number | string;
  name: string;
  handle: string;
  avatar?: string;
  time?: string;
  text?: string;
  image?: string;
}

export default function Post({ name, handle, avatar, time, text }: PostProps) {
  const displayTime = formatRelativeTime(time);
  // Ensure handle is a string
  const handleStr = typeof handle === 'string' ? handle : String(handle);
  const initials = handleStr?.charAt(1)?.toUpperCase() ?? handleStr?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <article className="mb-6">
      <div className="flex items-start gap-3">
        <Avatar size="md" src={avatar} alt={`${name} avatar`}>
          <div className="flex items-center justify-center w-full h-full text-sm font-bold text-text-white">{initials}</div>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-white">{name}</span>
            <span className="text-text-muted text-sm">{handleStr} · {displayTime}</span>
          </div>

          {text && (
            <p className="mt-2 text-sm leading-6 text-text-white whitespace-pre-wrap">{text}</p>
          )}

          {/* {image && (
            <div className="mt-3 border border-white border-2 rounded-xl">
              <img src={image} alt="post" className="w-full rounded-lg object-cover max-h-[420px]" />
            </div>
          )} */}
        </div>
      </div>
    </article>
  );
}
