

import { cn } from "../../lib/utils.ts";

interface FooterDataProps {
  alt?: string;
};

interface FooterViewProps {className?: string; }

export default function Footer({ className = "" }: FooterDataProps & FooterViewProps) {
  return (
    <footer className={cn("fixed bottom-0 left-0 right-0 bg-bg-black border-t border-border-dark", className)}>
      <div className="max-w-md mx-12 flex items-center justify-between  py-6">
        <button aria-label="Home" className="text-text-white flex flex-col items-center gap-1">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-white"><path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button aria-label="Recherche" className="text-text-white flex flex-col items-center gap-1">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>

        <button aria-label="Notifications" className="text-text-white flex flex-col items-center gap-1">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button aria-label="Messages" className="text-text-white flex flex-col items-center gap-1">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </footer>
  );

}

