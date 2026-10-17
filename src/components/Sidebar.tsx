import React, { useState } from 'react';
import {
  FileText,
  Bell,
  Star,
  Archive,
  Trash2,
  Plus,
  Cloud,
  Edit2,
  Check,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Label } from '../types/note';
import { DriveQuotaInfo } from '../services/driveService';

export type NavigationTab =
  | 'notes'
  | 'reminders'
  | 'starred'
  | 'archive'
  | 'trash'
  | `label-${string}`;

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  labels: Label[];
  onAddLabel: (name: string, color?: string) => void;
  onEditLabel: (id: string, name: string) => void;
  onDeleteLabel: (id: string) => void;
  notesCount: number;
  remindersCount: number;
  starredCount: number;
  archiveCount: number;
  trashCount: number;
  labelCounts: Record<string, number>;
  isOpen: boolean;
  onToggleSidebar: () => void;
  driveQuota: DriveQuotaInfo | null;
  onOpenStorageModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  labels,
  onAddLabel,
  onEditLabel,
  onDeleteLabel,
  notesCount,
  remindersCount,
  starredCount,
  archiveCount,
  trashCount,
  labelCounts,
  isOpen,
  onToggleSidebar,
  driveQuota,
  onOpenStorageModal,
}) => {
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#F87171');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState('');

  const handleCreateLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    onAddLabel(newLabelName.trim(), newLabelColor);
    setNewLabelName('');
  };

  const handleSaveEditLabel = (id: string) => {
    if (!editingLabelName.trim()) return;
    onEditLabel(id, editingLabelName.trim());
    setEditingLabelId(null);
  };

  // Nav items matching the reference image exactly
  const navItems = [
    { id: 'notes' as const, label: 'Notes', icon: FileText, count: notesCount },
    { id: 'reminders' as const, label: 'Reminders', icon: Bell, count: remindersCount },
    { id: 'starred' as const, label: 'Starred', icon: Star, count: starredCount },
    { id: 'archive' as const, label: 'Archive', icon: Archive, count: archiveCount },
    { id: 'trash' as const, label: 'Trash', icon: Trash2, count: trashCount },
  ];

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '2.4 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb < 1) {
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(1)} MB`;
    }
    return `${gb.toFixed(1)} GB`;
  };

  const usageText = driveQuota
    ? `${formatBytes(driveQuota.usage)} of ${formatBytes(driveQuota.limit)} used`
    : '2.4 GB of 15 GB used';

  const quotaPercent = driveQuota?.limit
    ? Math.min(100, Math.max(16, Math.round((driveQuota.usage / driveQuota.limit) * 100)))
    : 16;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-16 left-0 z-30 h-[calc(100vh-4rem)] bg-[#FFFBF2] dark:bg-[#0B111E] border-r border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between py-4 px-3.5 transition-all duration-200 select-none shrink-0 ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#FEF3C7] dark:bg-[#2A2315] text-[#D97706] dark:text-[#FBBF24] font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-[#D97706] dark:text-[#FBBF24]'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-xs ${
                        isActive
                          ? 'text-[#D97706] dark:text-[#FBBF24] font-semibold'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Labels Section */}
          <div>
            <div className="flex items-center justify-between px-3.5 mb-2.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Labels
              </span>
              <button
                onClick={() => setShowLabelModal(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                title="Add new label"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {labels.map((lbl) => {
                const tabKey = `label-${lbl.id}` as NavigationTab;
                const isActive = currentTab === tabKey;
                const count = labelCounts[lbl.id] || 0;
                const isEditingThis = editingLabelId === lbl.id;

                if (isEditingThis) {
                  return (
                    <div
                      key={lbl.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-[#FFBF24]"
                    >
                      <input
                        type="text"
                        value={editingLabelName}
                        onChange={(e) => setEditingLabelName(e.target.value)}
                        className="flex-1 text-xs bg-transparent focus:outline-none text-slate-900 dark:text-white"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditLabel(lbl.id);
                          if (e.key === 'Escape') setEditingLabelId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEditLabel(lbl.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingLabelId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={lbl.id}
                    className={`group w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-sm transition cursor-pointer ${
                      isActive
                        ? 'bg-[#FEF3C7] dark:bg-[#2A2315] text-[#D97706] dark:text-[#FBBF24] font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                    onClick={() => onSelectTab(tabKey)}
                  >
                    <div className="flex items-center gap-3 truncate flex-1 mr-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: lbl.color || '#F87171' }}
                      />
                      <span className="truncate">{lbl.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Hover actions: Edit & Delete */}
                      <div
                        className="hidden group-hover:flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLabelId(lbl.id);
                            setEditingLabelName(lbl.name);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                          title="Rename label"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLabel(lbl.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete label"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {count > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal group-hover:hidden">
                          {count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Storage Card matching reference image */}
        <div className="pt-4 mt-auto">
          <div
            onClick={onOpenStorageModal}
            className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition cursor-pointer shadow-2xs"
            title="Google Drive Storage Usage"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <Cloud className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Storage
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              {usageText}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#F59E0B] h-full rounded-full transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Label Creation & Management Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-heading">
                Manage Labels
              </h3>
              <button
                onClick={() => setShowLabelModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create new label input */}
            <form onSubmit={handleCreateLabel} className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="New label name..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFBF24]"
                />
                <button
                  type="submit"
                  disabled={!newLabelName.trim()}
                  className="px-3 py-2 bg-[#FFBF24] disabled:opacity-50 text-slate-900 font-semibold text-xs rounded-xl hover:bg-[#F59E0B] transition"
                >
                  Add
                </button>
              </div>

              {/* Color picker for label */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Color:</span>
                {['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#C084FC', '#2DD4BF', '#F43F5E', '#84A98C'].map(
                  (c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewLabelColor(c)}
                      className={`w-4 h-4 rounded-full transition transform hover:scale-125 ${
                        newLabelColor === c ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  )
                )}
              </div>
            </form>

            {/* Existing labels list */}
            <div className="mt-4 max-h-56 overflow-y-auto space-y-1">
              {labels.map((lbl) => (
                <div
                  key={lbl.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 group text-xs"
                >
                  {editingLabelId === lbl.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editingLabelName}
                        onChange={(e) => setEditingLabelName(e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-[#FFBF24] rounded-lg text-xs"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEditLabel(lbl.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: lbl.color || '#F87171' }}
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {lbl.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setEditingLabelId(lbl.id);
                            setEditingLabelName(lbl.name);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                          title="Rename label"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteLabel(lbl.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete label"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowLabelModal(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
