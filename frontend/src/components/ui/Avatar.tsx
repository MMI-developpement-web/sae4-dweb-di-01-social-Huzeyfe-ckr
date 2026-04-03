import { useState, useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { getMediaUrl } from "../../lib/api";
import type { ReactNode } from "react";


// Composant Avatar réutilisable avec gestion des erreurs de chargement d'image et variantes de taille

export const AvatarVariants = cva(
  "inline-block overflow-hidden rounded-full bg-text-muted",
  {
    variants: {
      size: {
        sm: "w-[40px] h-[40px]",
        md: "w-[56px] h-[56px]",
        lg: "w-[80px] h-[80px]",
        xl: "w-[86px] h-[86px]",
      },
      intent: {
        default: "",
      },
    },
    defaultVariants: {
      size: "md",
      intent: "default",
    },
  }
);

interface AvatarDataProps extends VariantProps<typeof AvatarVariants> {
  src?: string;
  alt?: string;
  children?: ReactNode;
}

interface AvatarViewProps {
  className?: string;
}

export default function Avatar({ children, size, className = "", src, alt }: AvatarDataProps & AvatarViewProps) {
  const [imageError, setImageError] = useState(false);
  const fullSrc = getMediaUrl(src);
  useEffect(() => {
    setImageError(false);
  }, [fullSrc]);

  const container = cn(AvatarVariants({ size }), className);

  return (
    <div className={container}>
      {fullSrc && !imageError ? (
        <img
          src={fullSrc}
          alt={alt || "avatar"}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        children
      )}
    </div>
  );
}