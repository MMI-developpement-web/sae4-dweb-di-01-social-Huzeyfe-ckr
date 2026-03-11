import React, { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";

export const inputVariants = cva(
  "w-full rounded border bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2",
  {
    variants: {
      variant: {
        default: "border-gray-700 text-[16px] py-6 mb-4  ",
        subtle: "border-gray-600 bg-[#0b0b0b]",
        light: "border-gray-300 bg-white text-black",
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

// Data props
interface InputProps extends VariantProps<typeof inputVariants> {
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

export default function Input({
  children,
  className = "",
  type = "text",
  placeholder,
  name,
  value,
  onChange,
  variant,
  size,
  as = "input",
  showToggle = true,
}: InputProps) {
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
    <div className="w-full">{children && (
        <label className="mb-1 block text-md font-bold">{children}</label>
      )}

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
              className="absolute top-1/2 right-3 -translate-y-2/3 text-gray-400 hover:text-gray-200"
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
