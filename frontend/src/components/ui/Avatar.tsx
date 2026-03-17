import { useState, useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

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

export interface AvatarProps extends VariantProps<typeof AvatarVariants> {
  children?: ReactNode;
  className?: string;
  src?: string;
  alt?: string;
}

export default function Avatar({ children, size, className, src, alt }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const container = cn(AvatarVariants({ size }), className);

  return (
    <div className={container}>
      {src && !imageError ? (
        <img
          src={src}
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