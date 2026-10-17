import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Trash2,
  Edit2,
  Check,
  X,
  Palette,
  Type,
  CornerDownRight,
} from 'lucide-react';
import { AppearancePreset } from '../types/note';

interface PresetsModalProps {
  isOpen: boolean;
  presets: AppearancePreset[];
  onApplyPresetToActive?: (preset: AppearancePreset) => void;
  onDeletePreset: (presetId: string) => void;
  onRenamePreset: (presetId: string, newName: string) => void;
  onClose: () => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  presets,
  onApplyPresetToActive,
  onDeletePreset,
  onRenamePreset,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleSaveRename = (id: string) => {
    if (!editingName.trim()) return;
    onRenamePreset(id, editingName.trim());
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFBF24]/20 rounded-xl text-[#F59E0B]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-heading">
                Appearance Presets Library
              </h3>
              <p className="text-xs text-slate-500">
                Curated and user-created styling configurations for Sesh@ notes
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

        {/* Presets Grid */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => {
              const { appearance } = preset;
              const isDark =
                appearance.bgType === 'solid' &&
                (appearance.bgColor === '#0F172A' || appearance.bgColor === '#18181B');

              return (
                <div
                  key={preset.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition-all hover:shadow-md flex flex-col justify-between relative overflow-hidden"
                  style={{
                    backgroundColor:
                      appearance.bgType === 'solid' ? appearance.bgColor : undefined,
                    backgroundImage:
                      appearance.bgType === 'gradient' ? appearance.bgGradient : undefined,
                  }}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2">
                      {editingId === preset.id ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full text-xs font-bold px-2 py-1 bg-white/90 rounded border border-[#FFBF24]"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(preset.id)}
                            className="p-1 text-emerald-600 bg-white rounded shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div
                            className={`text-sm font-bold font-heading truncate ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {preset.name}
                          </div>
                          <div
                            className={`text-xs opacity-75 truncate ${
                              isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {preset.description || (preset.isSystem ? 'System Preset' : 'Custom Preset')}
                          </div>
                        </div>
                      )}

                      {preset.isSystem ? (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/20 text-slate-700 dark:text-slate-200">
                          Built-in
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingId(preset.id);
                              setEditingName(preset.name);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 bg-white/60 dark:bg-black/40 rounded-lg"
                            title="Rename preset"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeletePreset(preset.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 bg-white/60 dark:bg-black/40 rounded-lg"
                            title="Delete preset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Preview details */}
                    <div
                      className="mt-3 text-xs flex flex-wrap gap-2 opacity-80"
                      style={{ color: appearance.textColor }}
                    >
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-mono">
                        Font: {appearance.fontFamily}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-mono">
                        Radius: {appearance.borderRadius}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#FFBF24] hover:bg-[#F59E0B] text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
