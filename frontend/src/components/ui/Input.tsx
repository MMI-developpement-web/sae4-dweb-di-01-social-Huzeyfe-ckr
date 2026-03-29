import React, { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";

// Composant d'input réutilisable avec variantes de style et de taille, gestion des types d'input (text, password, email) et possibilité d'afficher ou masquer le mot de passe


export const inputVariants = cva(
  "w-full rounded border bg-transparent text-text-white placeholder-text-muted focus:outline-none focus:ring-2",
  {
    variants: {
      variant: {
        default: "border-border-dark text-[16px] py-6 mb-4  ",
        subtle: "border-border-dark bg-surface-dark",
        light: "border-border bg-text-white text-text-dark",
        textarea: "flex flex-col min-h-[220px]  rounded border border-border-dark bg-transparent text-text-white placeholder-text-muted   p-3 focus:outline-none",
      },
      size: {
        sm: "h-10 px-3",
        md: "h-12 px-4  ",
        lg: "h-14 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);


// Types et props
interface InputDataProps extends VariantProps<typeof inputVariants>  {
    children?: React.ReactNode;
  className?: string;
  type?: "text" | "password" | "email";
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  as?: "input" | "textarea";
  showToggle?: boolean;
}

interface InputViewProps {className?: string; }


export default function Input({ className = "", ...rest }: InputDataProps & InputViewProps) {
  const {
    children,
    type = "text",
    placeholder,
    name,
    value,
    onChange,
    variant,
    size,
    as = "input",
    showToggle = true,
  } = rest as InputDataProps & InputViewProps;

  const [show, setShow] = useState(false);
  const classes = cn(inputVariants({ variant, size }), className);

  function EyeIcon({ open }: { open: boolean }) {
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {!open && <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
      </svg>
    );
  }

  return (
    <div className="w-full">
      {children && <label className="mb-1 block text-md font-bold">{children}</label>}

      {as === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={classes}
        />
      ) : (
        <div className="relative">
          <input
            name={name}
            type={type === "password" && show ? "text" : type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            className={classes}
          />

          {type === "password" && showToggle && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-2/3 text-text-muted hover:text-text-white"
              aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              <EyeIcon open={show} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
