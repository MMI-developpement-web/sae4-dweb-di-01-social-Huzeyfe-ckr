import { cn } from "../../lib/utils.ts";
interface HeaderDataProps {
  logoSrc?: string;
  alt?: string;
};

interface HeaderViewProps {className?: string; }

const DEFAULT_LOGO = "https://www.figma.com/api/mcp/asset/ef365f0c-1f67-46a3-abac-ee3ac9aeed23";

export default function Header({ logoSrc = DEFAULT_LOGO, alt = "logo", className = "" }: HeaderDataProps & HeaderViewProps) {
  return (
    <header className={cn("w-full relative flex items-center justify-center py-3", className)}>
      <div className="max-w-sm w-full flex items-center justify-center">
        <img src={logoSrc} alt={alt} className="w-16 h-16 object-contain" />
      </div>
    </header>
  );
}
 