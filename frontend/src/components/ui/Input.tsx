import React, { useId, useState } from "react";
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
export interface InputDataProps {
  children?: React.ReactNode; // used as visible label when provided
  showToggle?: boolean;
  className?: string;
}

// Props
export interface InputProps
  extends
    InputDataProps,
    VariantProps<typeof inputVariants>,
    React.InputHTMLAttributes<HTMLInputElement> {
  iconType?: "show" | "hide";
}

function IconEye({ name }: { name: NonNullable<InputProps["iconType"]> }) {
  switch (name) {
    case "hide":
      return (
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "show":
      return (
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 3l18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function Input({
  children,
  type = "text",
  className = "",
  variant,
  size,
  showToggle = true,
  iconType = "show",
  ...props
}: InputProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  const classes = cn(inputVariants({ variant, size }), className);

  return (
    <div className="w-full">
      {children && (
        <label
          htmlFor={props.id ?? id}
          className="mb-1 block text-md font-bold"
        >
          {children}
        </label>
      )}

      <div className="relative">
        <input
          id={props.id ?? id}
          type={isPassword && show ? "text" : type}
          className={classes}
          {...props}
        />

        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-200"
          >
            <IconEye name={show ? "hide" : iconType} />
          </button>
        )}
      </div>
    </div>
  );
}
