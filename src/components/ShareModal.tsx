import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Copy,
  Check,
  X,
  ExternalLink,
  Globe,
  Lock,
} from 'lucide-react';
import { Note, Collaborator } from '../types/note';

interface ShareModalProps {
  isOpen: boolean;
  note: Note;
  onUpdateCollaborators: (noteId: string, collaborators: Collaborator[]) => void;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  note,
  onUpdateCollaborators,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('editor');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (note.collaborators.some((c) => c.email.toLowerCase() === trimmed)) {
      setErrorMsg('User is already a collaborator');
      return;
    }

    const newCollaborator: Collaborator = {
      email: trimmed,
      role,
      addedAt: Date.now(),
      displayName: trimmed.split('@')[0],
    };

    onUpdateCollaborators(note.id, [...note.collaborators, newCollaborator]);
    setEmail('');
  };

  const handleRemoveCollaborator = (targetEmail: string) => {
    const updated = note.collaborators.filter((c) => c.email !== targetEmail);
    onUpdateCollaborators(note.id, updated);
  };

  const handleChangeRole = (targetEmail: string, newRole: 'viewer' | 'editor') => {
    const updated = note.collaborators.map((c) =>
      c.email === targetEmail ? { ...c, role: newRole } : c
    );
    onUpdateCollaborators(note.id, updated);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/#note-${note.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#93C5FD]/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-heading">
                Share Note
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                "{note.title || 'Untitled Note'}"
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

        {/* Add Collaborator Form */}
        <form onSubmit={handleAddCollaborator} className="mt-5 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Invite by Email
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFBF24]"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="px-2.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="editor">Can edit</option>
              <option value="viewer">Can view</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FFBF24] hover:bg-[#F59E0B] text-slate-900 font-bold text-xs rounded-xl shadow-xs transition shrink-0"
            >
              Invite
            </button>
          </div>
          {errorMsg && <p className="text-xs text-rose-500 mt-1">{errorMsg}</p>}
        </form>

        {/* Collaborators List */}
        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            People with Access
          </label>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Owner item */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#84A98C] text-white font-bold text-xs flex items-center justify-center">
                  You
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Owner (You)
                  </div>
                  <div className="text-[11px] text-slate-400">Stored in your Sesh@ Workspace</div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-200/50 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                Owner
              </span>
            </div>

            {/* Invited collaborators */}
            {note.collaborators.map((c) => (
              <div
                key={c.email}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {c.displayName?.charAt(0).toUpperCase() || c.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {c.displayName || c.email}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{c.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={c.role}
                    onChange={(e) => handleChangeRole(c.email, e.target.value as any)}
                    className="text-xs bg-slate-100 dark:bg-slate-700 py-1 px-2 rounded-lg border-none text-slate-700 dark:text-slate-200"
                  >
                    <option value="editor">Can edit</option>
                    <option value="viewer">Can view</option>
                  </select>

                  <button
                    onClick={() => handleRemoveCollaborator(c.email)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Revoke access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copy Share Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#D97706] dark:hover:text-[#FBBF24] p-1.5 rounded-lg transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Share Link</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
