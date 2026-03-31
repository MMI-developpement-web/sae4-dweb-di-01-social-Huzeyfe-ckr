
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";
import type { ReactNode, ButtonHTMLAttributes } from "react";

// Composant de bouton réutilisable avec variantes de style et de taille, utilisant class-variance-authority pour la gestion des classes CSS conditionnelles


export const buttonVariants = cva(
    // classes de base pour les boutons (pills)
    "inline-flex items-center justify-center rounded-full font-extrabold transition-colors focus:outline-none focus:ring-2",
    {
        variants: {
            variant: {
                solid: "bg-text-white text-text-dark hover:brightness-95 border border-bg-black border-4",
                dark: "bg-bg-black text-text-white hover:brightness-110 border border-text-white border-2",
                icon: "inline-flex items-center gap-2 bg-text-white text-text-dark",
                icons: "inline-flex items-center gap-2 bg-bg-black text-text-white",
                post: "bg-tick text-text-white hover:bg-surface-dark border border-border-dark border-2",
            },
            size: {
                sm: "text-sm px-4 py-2",
                md: "text-[20px] px-6 py-2",
                lg: "text-[22px] px-8 py-2",
                gg: "text-[20px] px-28 py-2",
                ggD: "text-[20px] pr-35 pl-35 py-2",
            },
            
        },
        defaultVariants: {
            variant: "solid",
            size: "md",
        },
    }
);

// Types et props
interface ButtonDataProps extends VariantProps<typeof buttonVariants>, ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

interface ButtonViewProps {
    className?: string;
}

export default function Button({ children, variant, size, icon, iconPosition = "left", className = "", ...props }: ButtonDataProps & ButtonViewProps) {
    const classes = cn(buttonVariants({ variant, size }), className);

    return (
        <button className={classes} {...props}>
            {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
            {children}
            {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
        </button>
    );
}
