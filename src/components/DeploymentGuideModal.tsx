import React, { useState } from 'react';
import {
  Rocket,
  Server,
  Globe,
  HardDrive,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Terminal,
  FileCode,
} from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const vercelEnv = `# Vercel Environment Variables (Frontend)
NEXT_PUBLIC_APP_URL=https://your-sesh-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-sesh-backend.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1234567890-xxx.apps.googleusercontent.com`;

  const renderEnv = `# Render Environment Variables (Backend)
PORT=10000
NODE_ENV=production
FRONTEND_ORIGIN=https://your-sesh-app.vercel.app
GOOGLE_CLIENT_ID=1234567890-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
SESSION_SECRET=super_random_hex_string_32_bytes`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#84A98C]/20 rounded-xl text-[#84A98C]">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-heading">
                Zero-Budget Architecture & Deployment
              </h3>
              <p className="text-xs text-slate-500">
                Deploy Sesh@ on Vercel Hobby (Frontend) & Render Free Web Service (Backend)
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs text-slate-600 dark:text-slate-300">
          {/* Architecture Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1.5">
                <Globe className="w-4 h-4 text-sky-500" />
                <span>Frontend (Vercel)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Deployed on Vercel Hobby (free). Next.js App Router, Tailwind CSS, IndexedDB offline cache, and Motion.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1.5">
                <Server className="w-4 h-4 text-emerald-500" />
                <span>Backend (Render)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Deployed on Render Free Web Service (free). Lightweight Node/Express API, OAuth token validation, CORS, and health checks.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1.5">
                <HardDrive className="w-4 h-4 text-[#FFBF24]" />
                <span>Storage (Google Drive)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Zero infrastructure cost: User's personal 15GB Google Drive is the source of truth for notes, drawings, and images!
              </p>
            </div>
          </div>

          {/* Vercel instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-blue-500" />
                1. Frontend Deployment (Vercel Hobby)
              </h4>
              <button
                onClick={() => copyText('vercel', vercelEnv)}
                className="flex items-center gap-1 text-[11px] text-[#F59E0B] hover:underline"
              >
                {copiedKey === 'vercel' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy .env.example</span>
              </button>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 mb-2">
              <li>Root Directory: <code>frontend/</code> or root</li>
              <li>Framework Preset: <strong>Next.js</strong> or <strong>Vite</strong></li>
              <li>Build Command: <code>npm run build</code></li>
              <li>Output Directory: <code>.next</code> or <code>dist</code></li>
            </ul>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
              {vercelEnv}
            </pre>
          </div>

          {/* Render instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-500" />
                2. Backend Deployment (Render Free Web Service)
              </h4>
              <button
                onClick={() => copyText('render', renderEnv)}
                className="flex items-center gap-1 text-[11px] text-[#F59E0B] hover:underline"
              >
                {copiedKey === 'render' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy .env.example</span>
              </button>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 mb-2">
              <li>Environment: <strong>Node</strong></li>
              <li>Build Command: <code>npm run build</code></li>
              <li>Start Command: <code>node dist/server.js</code></li>
              <li>Health Check Path: <code>/api/health</code></li>
              <li>Handles Render cold starts with friendly status indicators and exponential backoff retry.</li>
            </ul>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
              {renderEnv}
            </pre>
          </div>

          {/* Google Cloud Console configuration */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              3. Google Cloud OAuth Consent & Authorized Origins
            </h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
              Add your deployed Vercel domain to Authorized JavaScript Origins in GCP Console:
            </p>
            <div className="space-y-1 font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
              <div>Authorized JavaScript origins: <code>https://your-sesh-app.vercel.app</code></div>
              <div>Authorized redirect URIs: <code>https://your-sesh-app.firebaseapp.com/__/auth/handler</code></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#FFBF24] hover:bg-[#F59E0B] text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
