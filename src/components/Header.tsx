import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Sun,
  Moon,
  LayoutGrid,
  ChevronsLeft,
  ChevronsRight,
  HardDrive,
  RefreshCw,
  LogOut,
  FolderOpen,
  Check,
} from 'lucide-react';
import { SyncState, WorkspaceSettings } from '../types/note';
import { DriveQuotaInfo } from '../services/driveService';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  syncState: SyncState;
  syncError?: string;
  onManualSync: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  settings: WorkspaceSettings;
  onUpdateSettings: (s: Partial<WorkspaceSettings>) => void;
  driveQuota: DriveQuotaInfo | null;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSettings: () => void;
  onOpenDeployment: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  syncState,
  syncError,
  onManualSync,
  searchQuery,
  onSearchChange,
  settings,
  onUpdateSettings,
  driveQuota,
  onToggleSidebar,
  isSidebarOpen,
  onOpenSettings,
  onOpenDeployment,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAppsMenu, setShowAppsMenu] = useState(false);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '2.4 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb < 1) {
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(1)} MB`;
    }
    return `${gb.toFixed(1)} GB`;
  };

  const isDarkMode = settings.theme === 'dark';

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FFFBF2] dark:bg-[#0B111E] border-b border-slate-200/60 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Logo & Collapse Button */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => onSearchChange('')}
        >
          <img
            src={isDarkMode ? '/logo-dark.svg' : '/logo.svg'}
            alt="Sesh@"
            className="h-9 sm:h-10 w-auto object-contain max-w-[150px] sm:max-w-[180px]"
          />
        </div>

        {/* Sidebar Collapse Toggle « / » */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition ml-1 cursor-pointer"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? (
            <ChevronsLeft className="w-4 h-4" />
          ) : (
            <ChevronsRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Center: Search Bar matching reference */}
      <div className="flex-1 max-w-2xl relative mx-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, labels, or anything..."
            className="w-full pl-11 pr-11 py-2.5 bg-white/90 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400/90 focus:outline-none focus:ring-2 focus:ring-[#FFBF24]/60 shadow-2xs transition"
          />

          <button
            type="button"
            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Filter options"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Theme Toggle, App Switcher, User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Sun/Moon Toggle */}
        <button
          onClick={() =>
            onUpdateSettings({ theme: isDarkMode ? 'light' : 'dark' })
          }
          className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title={isDarkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-[#FFBF24]" />
          ) : (
            <Sun className="w-5 h-5 text-slate-600 hover:text-slate-900" />
          )}
        </button>

        {/* 3x3 Apps / Tools Grid Icon */}
        <div className="relative">
          <button
            onClick={() => setShowAppsMenu(!showAppsMenu)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Sesh@ Tools & Actions"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          {showAppsMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-40 animate-in fade-in">
              <button
                onClick={() => {
                  setShowAppsMenu(false);
                  onManualSync();
                }}
                className="w-full px-3 py-2 text-xs flex items-center gap-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <RefreshCw className="w-4 h-4 text-[#F59E0B]" />
                <span>Sync with Google Drive</span>
              </button>
              <button
                onClick={() => {
                  setShowAppsMenu(false);
                  onOpenSettings();
                }}
                className="w-full px-3 py-2 text-xs flex items-center gap-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <FolderOpen className="w-4 h-4 text-slate-400" />
                <span>Workspace Settings</span>
              </button>
              <button
                onClick={() => {
                  setShowAppsMenu(false);
                  onOpenDeployment();
                }}
                className="w-full px-3 py-2 text-xs flex items-center gap-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <HardDrive className="w-4 h-4 text-[#84A98C]" />
                <span>Deployment & Architecture</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar with letter 'P' in peach circle */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-[#FCA5A5] text-white font-bold text-sm flex items-center justify-center hover:ring-2 hover:ring-[#FFBF24] transition shadow-xs cursor-pointer"
            title={user?.email || 'User Profile'}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{user?.displayName?.charAt(0).toUpperCase() || 'P'}</span>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-[#FCA5A5] text-white font-bold text-base flex items-center justify-center">
                  {user?.displayName?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {user?.displayName || 'Pranesh'}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {user?.email || 'esppranesh@gmail.com'}
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-sm">
                    Google Drive Connected
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onManualSync();
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <span>Sync Google Drive</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition"
                >
                  <FolderOpen className="w-4 h-4 text-slate-400" />
                  <span>Workspace Preferences</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
