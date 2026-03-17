
import Avatar from "./Avatar";
import { getCurrentUser } from "../../lib/api";
import type { User } from "../../lib/api";

export interface ProfileProps {
  // optional override props in case caller wants to force values
  name?: string;
  handle?: string;
  image?: string;
}

export default function Profile({ name: propName, handle: propHandle, image: propImage }: ProfileProps) {
  const current = getCurrentUser() as User | null;

  const name = propName ?? current?.name ?? "Invité";
  const handle = propHandle ?? current?.user ?? "guest";

  const rawPp = current?.pp || undefined;
  const avatarSrc = propImage ?? (rawPp && rawPp !== "null" ? rawPp : `https://picsum.photos/seed/${encodeURIComponent(handle)}/200`);









  return (
    <article className="bg-black p-4"> 
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Avatar size="md" src={avatarSrc} alt={`${name} avatar`}>
            <div className="flex items-center justify-center w-full h-full text-sm font-bold text-text-white">{handle?.charAt(0).toUpperCase() ?? "U"}</div>
          </Avatar>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white text-xl">{name}</span>
            <div className="ml-2 flex items-center gap-1 text-gray-500 text-lg">
              <span>@{handle}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}