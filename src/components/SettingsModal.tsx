import React from 'react';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Paintbrush,
  CheckSquare,
  RefreshCw,
  HardDrive,
  LogOut,
  X,
  Check,
} from 'lucide-react';
import { WorkspaceSettings } from '../types/note';
import { SESH_COLORS } from '../constants/presets';

interface SettingsModalProps {
  isOpen: boolean;
  settings: WorkspaceSettings;
  onUpdateSettings: (settings: Partial<WorkspaceSettings>) => void;
  onReconcileDrive: () => void;
  onOpenDriveReview?: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onReconcileDrive,
  onOpenDriveReview,
  onLogout,
  onClose,
}) => {
  if (!isOpen) return null;

  const ACCENTS = [
    { name: 'Sesh Yellow', hex: '#FFBF24' },
    { name: 'Warm Amber', hex: '#F59E0B' },
    { name: 'Botanical Sage', hex: '#84A98C' },
    { name: 'Sky Blue', hex: '#93C5FD' },
    { name: 'Peach Glow', hex: '#FCA5A5' },
    { name: 'Midnight', hex: '#0F172A' },
  ];

  const WALLPAPERS = [
    { id: 'default', label: 'Default Solid' },
    { id: 'dots', label: 'Polka Dots' },
    { id: 'grid', label: 'Isometric Grid' },
    { id: 'sunset', label: 'Warm Sunset' },
    { id: 'sage', label: 'Sage Mist' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-heading">
                Workspace Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Personalize your Sesh@ creative environment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Theme Mode
              </label>
              <span className="text-[11px] text-slate-400">
                100% user controllable
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'light', label: 'Light Theme', icon: Sun },
                { id: 'dark', label: 'Dark Theme', icon: Moon },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = settings.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ theme: t.id as any })}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
                      isSelected
                        ? 'bg-[#FFBF24]/20 border-[#FFBF24] text-[#D97706] dark:text-[#FBBF24] ring-1 ring-[#FFBF24]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

          {/* Accent Color */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              {ACCENTS.map((acc) => (
                <button
                  key={acc.hex}
                  onClick={() => onUpdateSettings({ accentColor: acc.hex })}
                  className={`w-8 h-8 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center ${
                    settings.accentColor === acc.hex
                      ? 'border-[#0F172A] dark:border-white ring-2 ring-[#FFBF24]/60 scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: acc.hex }}
                  title={acc.name}
                >
                  {settings.accentColor === acc.hex && (
                    <Check className="w-4 h-4 text-slate-900 stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Workspace Wallpaper */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Workspace Wallpaper
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => onUpdateSettings({ workspaceWallpaper: wp.id as any })}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition ${
                    settings.workspaceWallpaper === wp.id
                      ? 'bg-[#FFBF24]/20 border-[#FFBF24] text-[#D97706] dark:text-[#FBBF24]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {wp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist behavior */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Move completed checklist items to bottom
              </span>
              <input
                type="checkbox"
                checked={settings.autoMoveCompletedToBottom}
                onChange={(e) =>
                  onUpdateSettings({ autoMoveCompletedToBottom: e.target.checked })
                }
                className="w-4 h-4 accent-[#FFBF24] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Show checklist completion progress bar
              </span>
              <input
                type="checkbox"
                checked={settings.showChecklistProgress}
                onChange={(e) =>
                  onUpdateSettings({ showChecklistProgress: e.target.checked })
                }
                className="w-4 h-4 accent-[#FFBF24] rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Google Drive Health & Storage Review */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Google Drive Health & Storage</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                drive.file scope active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sesh@ creates, accesses, and organizes your note files, drawings, custom presets, and image attachments directly in your Google Drive workspace folder.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onReconcileDrive();
                  onClose();
                }}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                <span>Reconcile Workspace</span>
              </button>
              {onOpenDriveReview && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDriveReview();
                  }}
                  className="py-2 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition border border-amber-200 dark:border-amber-800/60"
                >
                  <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                  <span>Review Drive Card</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#FFBF24] hover:bg-[#F59E0B] text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
