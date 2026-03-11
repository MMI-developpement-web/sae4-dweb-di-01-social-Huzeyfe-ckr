import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";
import type { ReactNode, ButtonHTMLAttributes } from "react";

export const buttonVariants = cva(
    // classes de base pour les boutons (pills)
    "inline-flex items-center justify-center rounded-full font-extrabold transition-colors focus:outline-none focus:ring-2",
    {
        variants: {
            variant: {
                solid: "bg-white text-black hover:brightness-95 border border-black border-4",
                dark: "bg-black text-white hover:brightness-110 border border-white border-2",
                icon: "inline-flex items-center gap-2 bg-white text-black",
                icons: "inline-flex items-center gap-2 bg-black text-white",
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
interface ButtonDataProps {
    children?: ReactNode;
}


export interface ButtonProps
    extends ButtonDataProps,
        VariantProps<typeof buttonVariants>,
        ButtonHTMLAttributes<HTMLButtonElement> {
    iconType?: "download" | "comments" | "like" | "repost" | "stats" | "edit" | "logout" | "Cancel";
    iconPosition?: "left" | "right";
}






function Icon({ name }: { name: NonNullable<ButtonProps["iconType"]> }) {
    switch (name) {
        case "download":
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 21H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "comments":
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "like":
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "repost":
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M21 15V8a2 2 0 0 0-2-2h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 9v7a2 2 0 0 0 2 2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "stats":
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "edit":
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4L18.5 2.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "logout":
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
         case "Cancel":
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        default:
            return null;
    }
}








export default function Button({ children, variant, size, iconType, iconPosition = "left", className, ...props }: ButtonProps) {
    const classes = cn(buttonVariants({ variant, size }), className);

    return (
        <button className={classes} {...props}>
            {iconType && iconPosition === "left" && <span className="mr-2"><Icon name={iconType} /></span>}
            {children}
            {iconType && iconPosition === "right" && <span className="ml-2"><Icon name={iconType} /></span>}
        </button>
    );
}
