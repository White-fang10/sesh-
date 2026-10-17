import React, { useState } from 'react';
import {
  HardDrive,
  FileText,
  PenTool,
  Sparkles,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { DriveQuotaInfo } from '../services/driveService';

interface GoogleDriveConnectionCardProps {
  isConnected?: boolean;
  isLoading?: boolean;
  error?: string | null;
  driveQuota?: DriveQuotaInfo | null;
  onConnect?: () => void;
  onSync?: () => void;
  onOpenFolder?: () => void;
  onDisconnect?: () => void;
  variant?: 'welcome' | 'modal' | 'embedded';
}

export const GoogleDriveConnectionCard: React.FC<GoogleDriveConnectionCardProps> = ({
  isConnected = false,
  isLoading = false,
  error = null,
  driveQuota = null,
  onConnect,
  onSync,
  onOpenFolder,
  onDisconnect,
  variant = 'welcome',
}) => {
  const [hasConsented, setHasConsented] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Storage Quota calculations
  const totalLimit = driveQuota?.limit || 15 * 1024 * 1024 * 1024;
  const usage = driveQuota?.usage || 0;
  const usagePercentage = Math.min(100, Math.round((usage / totalLimit) * 100));
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const capabilities = [
    {
      id: 'notes',
      icon: <FileText className="w-5 h-5 text-amber-500" />,
      title: 'Note Files',
      badge: 'Auto-saved JSON',
      description:
        'Create, access, and organize your text notes and interactive checklist files directly in Google Drive with instant local backup.',
      tag: 'Bidirectional Sync',
    },
    {
      id: 'drawings',
      icon: <PenTool className="w-5 h-5 text-emerald-500" />,
      title: 'Drawings & Sketches',
      badge: 'Vector & Canvas',
      description:
        'Store stylus stroke vectors, canvas states, and high-fidelity drawings directly in your workspace folder.',
      tag: 'Stylus Optimized',
    },
    {
      id: 'presets',
      icon: <Sparkles className="w-5 h-5 text-sky-500" />,
      title: 'Custom Presets',
      badge: 'Design Studio',
      description:
        'Save and synchronize your custom color themes, vibrant gradients, textures, and typography presets across devices via Drive.',
      tag: 'Multi-Device',
    },
    {
      id: 'images',
      icon: <ImageIcon className="w-5 h-5 text-purple-500" />,
      title: 'Image Attachments',
      badge: 'Original Quality',
      description:
        'Upload, organize, and view image attachments and visual covers directly inside your user-owned Google Drive workspace folder.',
      tag: 'Zero Compression',
    },
  ];

  return (
    <div
      className={`w-full max-w-3xl mx-auto rounded-3xl bg-white dark:bg-[#121826] border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all ${
        variant === 'embedded' ? 'p-5 sm:p-7' : 'p-6 sm:p-8'
      }`}
    >
      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            {/* Google Drive Logo SVG */}
            <svg className="w-7 h-7" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path
                d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                fill="#0066da"
              />
              <path
                d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z"
                fill="#00ac47"
              />
              <path
                d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                fill="#ea4335"
              />
              <path
                d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
                fill="#00832d"
              />
              <path
                d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                fill="#2684fc"
              />
              <path
                d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                fill="#ffba00"
              />
            </svg>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">
                Connect Google Drive to Sesh@
              </h2>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Permission Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              User-Authorized Workspace Storage &bull; Folder: <code className="text-amber-600 dark:text-amber-400 font-mono">Sesh@ Workspace</code>
            </p>
          </div>
        </div>

        {isConnected && onSync && (
          <button
            onClick={onSync}
            disabled={isLoading}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Sync with Google Drive now"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Workspace</span>
          </button>
        )}
      </div>

      {/* Main Core Review Copy Banner */}
      <div className="bg-[#FFFBF2] dark:bg-[#161F30] rounded-2xl p-4 sm:p-5 border border-amber-200/70 dark:border-amber-900/50 text-left mb-6">
        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
          Review the card below to connect Google Drive to Sesh@. Once enabled, the application will be able to{' '}
          <strong className="text-slate-950 dark:text-white font-bold underline decoration-amber-400 decoration-2 underline-offset-2">
            create, access, and organize your note files, drawings, custom presets, and image attachments
          </strong>{' '}
          directly in your Google Drive workspace, with permission from the app's users.
        </p>
      </div>

      {/* 4 Capabilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left mb-6">
        {capabilities.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161F30]/90 border border-slate-200/70 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-600/50 transition group"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {item.badge}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
                {item.tag}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Connected Account & Drive Quota (If Connected) */}
      {isConnected && driveQuota && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Google Drive Storage Quota
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {formatBytes(usage)} used of {formatBytes(totalLimit)} ({usagePercentage}%)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                usagePercentage > 90
                  ? 'bg-rose-500'
                  : usagePercentage > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(2, usagePercentage)}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500">
            <span>
              Connected as: <strong className="text-slate-800 dark:text-slate-200">{driveQuota.userEmail || 'Google User'}</strong>
            </span>
            {onOpenFolder && (
              <button
                onClick={onOpenFolder}
                className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Open Sesh@ Workspace Folder</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Privacy Guarantee & Scope Transparency */}
      <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900/50 p-4 text-left mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <span>Strict Zero-Leak Privacy Guarantee</span>
              <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/70 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-200">
                drive.file scope
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Sesh@ requests the restricted <code>auth/drive.file</code> scope. The app can <strong>only</strong> access and organize files created by Sesh@ itself. It cannot view, read, or modify any of your other private Docs, Photos, or personal Google Drive files.
            </p>
          </div>
        </div>
      </div>

      {/* Explicit User Consent Checkbox (When not yet connected) */}
      {!isConnected && (
        <label className="flex items-start gap-3 text-left mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasConsented}
            onChange={(e) => setHasConsented(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
          />
          <span className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
            I confirm permission for Sesh@ to create and organize my note files, drawings, custom presets, and image attachments in my Google Drive workspace.
          </span>
        </label>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {!isConnected ? (
          <button
            onClick={onConnect}
            disabled={isLoading || !hasConsented}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm rounded-2xl border border-slate-300 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {/* Google G Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>{isLoading ? 'Connecting to Google Drive...' : 'Enable & Connect Google Drive'}</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {onOpenFolder && (
              <button
                onClick={onOpenFolder}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Open Sesh@ Workspace</span>
              </button>
            )}
            {onDisconnect && (
              <button
                onClick={onDisconnect}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 font-semibold text-xs transition cursor-pointer"
              >
                Disconnect Drive
              </button>
            )}
          </div>
        )}

        {/* Technical Details Toggle */}
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition cursor-pointer mt-2 sm:mt-0"
        >
          <span>Technical architecture details</span>
          {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Technical Details */}
      {showTechnicalDetails && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-left text-xs text-slate-500 dark:text-slate-400 space-y-2 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">Workspace Folder ID:</span>
              <code className="text-amber-600 dark:text-amber-400 font-mono text-[10px]">
                Google Drive &gt; Sesh@ Workspace
              </code>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">Master Index:</span>
              <code className="text-amber-600 dark:text-amber-400 font-mono text-[10px]">
                workspace-index.json (Presets, Labels, Settings)
              </code>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">Note Storage:</span>
              <code className="text-amber-600 dark:text-amber-400 font-mono text-[10px]">
                note_[id].json (Checklists, Drawings, Appearance)
              </code>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">Attachments:</span>
              <code className="text-amber-600 dark:text-amber-400 font-mono text-[10px]">
                img_[timestamp]_[name] directly in Drive folder
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
