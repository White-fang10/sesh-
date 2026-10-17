import React from 'react';
import { ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react';
import { GoogleDriveConnectionCard } from './GoogleDriveConnectionCard';

interface AuthWelcomeProps {
  onSignIn: () => void;
  isLoading: boolean;
  error?: string | null;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const AuthWelcome: React.FC<AuthWelcomeProps> = ({
  onSignIn,
  isLoading,
  error,
  isDarkMode = false,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-[#FFFBF2] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#FFBF24] selection:text-slate-900 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200/60 dark:border-slate-800/60 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={isDarkMode ? '/logo-dark.svg' : '/logo.svg'}
            alt="Sesh@"
            className="h-9 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% User-Owned Google Drive Storage
          </span>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
              title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-[#FFBF24]" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* Hero & Google Drive Connection Card Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex-1 flex flex-col items-center justify-center text-center w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFBF24]/20 border border-[#FFBF24]/40 text-[#D97706] dark:text-[#FBBF24] text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <span>Next-Generation Notes Workspace</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight font-heading max-w-3xl leading-[1.2] mb-3">
          A personal, expressive workspace for your thoughts & sketches.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-sans mb-8">
          Inspired by the speed of Google Keep, elevated with{' '}
          <strong className="text-slate-900 dark:text-white font-semibold">
            Note Design Studio
          </strong>
          , stylus drawing canvases, interactive checklists, and Google Drive-first storage architecture.
        </p>

        {/* The Google Drive Connection Card */}
        <GoogleDriveConnectionCard
          isConnected={false}
          isLoading={isLoading}
          error={error}
          onConnect={onSignIn}
          variant="welcome"
        />
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-200/60 dark:border-slate-800/60 px-6 sm:px-12 flex items-center justify-between text-xs text-slate-400">
        <div>&copy; Sesh@ Workspace. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span>Zero-Budget Architecture</span>
          <span>&bull;</span>
          <span>Google Drive API v3</span>
        </div>
      </footer>
    </div>
  );
};
