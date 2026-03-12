import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

// Images exportées depuis Figma MCP
const imgImage1 = "https://www.figma.com/api/mcp/asset/0dfa1a38-0fb6-4fcf-8380-9da1f00f9794";
const imgImage2 = "https://www.figma.com/api/mcp/asset/baa4e700-83cd-4740-8903-2724ecca9a98";
const imgImage6 = "https://www.figma.com/api/mcp/asset/8358628a-90cc-45ea-ace2-effe58762c16";
const imgProperty1Avatar = "https://www.figma.com/api/mcp/asset/396bdbf3-9ddb-4070-8f6d-0f29d5d2e3cc";
const imgEllipse21 = "https://www.figma.com/api/mcp/asset/666c5884-b856-4d38-93e6-2b50eb51a643";
const imgIntersect = "https://www.figma.com/api/mcp/asset/0cf28b02-58e7-47b6-b792-d3303496ffd3";

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

// Data props
export interface AvatarDataProps {
  children?: ReactNode;
  variant?: "default" | "leo" | "mao" | "mehmet";
}

export interface AvatarProps extends AvatarDataProps, VariantProps<typeof AvatarVariants> {
  className?: string;
}

export default function Avatar({ children, variant = "default", size, className, ...props }: AvatarProps) {
  const isLeo = variant === "leo";
  const isMao = variant === "mao";
  const isMehmet = variant === "mehmet";

  // Container classes
  const container = cn(AvatarVariants({ size }), className);

  return (
    <div className={container} {...props}>
      {/* default avatar (decorative) */}
      {variant === "default" && (
        <div className="relative w-full h-full">
          <img src={imgProperty1Avatar} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
          <img src={imgEllipse21} alt="overlay" className="absolute inset-0 w-full h-full pointer-events-none" />
          <img src={imgIntersect} alt="intersect" className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
      )}

      {isLeo && (
        <div className="relative w-full h-full overflow-hidden rounded-full">
          <img src={imgImage1} alt="leo" className="absolute left-0 top-0 w-[120%] h-[120%] object-cover" />
        </div>
      )}

      {isMao && (
        <div className="relative w-full h-full overflow-hidden rounded-full">
          <img src={imgImage2} alt="mao" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      )}

      {isMehmet && (
        <div className="relative w-full h-full overflow-hidden rounded-full">
          <img src={imgImage6} alt="mehmet" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      )}

      {/* fallback children (initials etc.) */}
      {children}
    </div>
  );
}