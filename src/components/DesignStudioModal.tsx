import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Type,
  LayoutTemplate,
  Save,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Sliders,
  Image as ImageIcon,
  Layers,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { NoteAppearance, AppearancePreset } from '../types/note';
import {
  DEFAULT_NOTE_APPEARANCE,
  SOLID_PALETTE,
  GRADIENT_PALETTE,
  SYSTEM_PRESETS,
} from '../constants/presets';
import { getContrastingTextColor, autoAdjustNoteAppearance } from '../utils/contrast';

interface DesignStudioModalProps {
  isOpen: boolean;
  currentAppearance: NoteAppearance;
  presets: AppearancePreset[];
  onApplyAppearance: (appearance: NoteAppearance) => void;
  onSavePreset: (name: string, appearance: NoteAppearance) => void;
  onClose: () => void;
}

export const DesignStudioModal: React.FC<DesignStudioModalProps> = ({
  isOpen,
  currentAppearance,
  presets,
  onApplyAppearance,
  onSavePreset,
  onClose,
}) => {
  const [appearance, setAppearance] = useState<NoteAppearance>(currentAppearance);
  const [activeTab, setActiveTab] = useState<'background' | 'typography' | 'card' | 'presets'>('background');
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePresetInput, setShowSavePresetInput] = useState(false);
  const [presetSavedNotice, setPresetSavedNotice] = useState(false);

  if (!isOpen) return null;

  const update = (patch: Partial<NoteAppearance>) => {
    setAppearance((prev) => ({ ...prev, ...patch }));
  };

  const handleApply = () => {
    onApplyAppearance(appearance);
    onClose();
  };

  const handleReset = () => {
    setAppearance({ ...DEFAULT_NOTE_APPEARANCE });
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName.trim(), appearance);
    setNewPresetName('');
    setShowSavePresetInput(false);
    setPresetSavedNotice(true);
    setTimeout(() => setPresetSavedNotice(false), 3000);
  };

  // Check contrast readability helper
  const isDarkBg =
    appearance.bgType === 'solid'
      ? appearance.bgColor === '#0F172A' || appearance.bgColor === '#18181B' || appearance.bgColor === '#334155'
      : appearance.bgGradient?.includes('#0F172A') || appearance.bgGradient?.includes('#18181B');
  const isDarkText = appearance.textColor === '#0F172A' || appearance.textColor === '#1E293B';
  const hasContrastWarning = (isDarkBg && isDarkText) || (!isDarkBg && appearance.textColor === '#FFFFFF');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Controls & Tabs */}
        <div className="w-full md:w-3/5 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#FFBF24]/20 rounded-xl text-[#F59E0B]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-heading">
                  Note Design Studio
                </h3>
                <p className="text-xs text-slate-500">
                  Customize card surface, colors, fonts, and borders
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50/60 dark:bg-slate-800/40">
            <button
              onClick={() => setActiveTab('background')}
              className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'background'
                  ? 'border-[#FFBF24] text-[#D97706] dark:text-[#FBBF24]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Background</span>
            </button>

            <button
              onClick={() => setActiveTab('typography')}
              className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'typography'
                  ? 'border-[#FFBF24] text-[#D97706] dark:text-[#FBBF24]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Typography</span>
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'card'
                  ? 'border-[#FFBF24] text-[#D97706] dark:text-[#FBBF24]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Card Frame</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'presets'
                  ? 'border-[#FFBF24] text-[#D97706] dark:text-[#FBBF24]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Presets</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* --- TAB 1: BACKGROUND --- */}
            {activeTab === 'background' && (
              <div className="space-y-5">
                {/* Background Type selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
                    Style Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['solid', 'gradient', 'image'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => update({ bgType: mode })}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                          appearance.bgType === mode
                            ? 'bg-[#FFBF24]/20 border-[#FFBF24] text-[#D97706] dark:text-[#FBBF24]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Solid Colors */}
                {appearance.bgType === 'solid' && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
                      Curated Solid Palette
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                      {SOLID_PALETTE.map((item) => (
                        <button
                          key={item.color}
                          onClick={() => {
                            const contrastText = getContrastingTextColor(item.color);
                            update({
                              bgColor: item.color,
                              textColor: contrastText,
                            });
                          }}
                          className={`h-11 rounded-xl border flex flex-col items-center justify-center relative transition transform hover:scale-105 shadow-2xs ${
                            appearance.bgColor === item.color
                              ? 'border-[#FFBF24] ring-2 ring-[#FFBF24]/50'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.name}
                        >
                          {appearance.bgColor === item.color && (
                            <Check className="w-4 h-4 text-slate-800 dark:text-slate-200 stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-xs text-slate-500 font-medium">Custom color:</label>
                      <input
                        type="color"
                        value={appearance.bgColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          const contrastText = getContrastingTextColor(val);
                          update({ bgColor: val, textColor: contrastText });
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                      />
                      <span className="text-xs text-slate-400 font-mono">{appearance.bgColor}</span>
                    </div>
                  </div>
                )}

                {/* Gradient Palettes */}
                {appearance.bgType === 'gradient' && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
                      Curated Vibrant Gradients
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {GRADIENT_PALETTE.map((g) => (
                        <button
                          key={g.name}
                          onClick={() => {
                            const contrastText = getContrastingTextColor(g.gradient);
                            update({
                              bgGradient: g.gradient,
                              textColor: contrastText,
                            });
                          }}
                          className={`h-16 rounded-xl border p-2 flex items-end justify-start text-[11px] font-semibold text-slate-800 transition transform hover:scale-102 shadow-2xs ${
                            appearance.bgGradient === g.gradient
                              ? 'border-[#FFBF24] ring-2 ring-[#FFBF24]/60'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                          style={{ background: g.gradient }}
                        >
                          <span className="bg-white/70 px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                            {g.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {appearance.bgType === 'image' && (
                  <div className="space-y-4">
                    {/* Custom Background Image File Upload */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                      <label className="cursor-pointer block">
                        <Upload className="w-5 h-5 mx-auto text-[#F59E0B] mb-1.5" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Upload Custom Background Image
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          PNG, JPG, WebP supported from your device
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              update({
                                bgType: 'image',
                                bgImageUrl: dataUrl,
                                bgOverlayOpacity: 0.85,
                                textColor: '#0F172A',
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                        Or Image URL
                      </label>
                      <input
                        type="url"
                        value={appearance.bgImageUrl || ''}
                        onChange={(e) => update({ bgImageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFBF24]"
                      />
                    </div>

                    {/* Quick textured suggestions */}
                    <div>
                      <span className="text-xs text-slate-400 block mb-2 font-medium">
                        Quick Texture Presets:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            name: 'Cork Board',
                            url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60',
                          },
                          {
                            name: 'Paper Texture',
                            url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
                          },
                          {
                            name: 'Soft Linen',
                            url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
                          },
                        ].map((tex) => (
                          <button
                            key={tex.name}
                            onClick={() => update({ bgImageUrl: tex.url })}
                            className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 text-left truncate"
                          >
                            {tex.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Opacity & Blur Sliders */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Overlay Opacity</span>
                          <span>{Math.round((appearance.bgOverlayOpacity ?? 0.8) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={appearance.bgOverlayOpacity ?? 0.8}
                          onChange={(e) => update({ bgOverlayOpacity: Number(e.target.value) })}
                          className="w-full accent-[#FFBF24]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Backdrop Blur</span>
                          <span>{appearance.bgBlur ?? 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="16"
                          step="1"
                          value={appearance.bgBlur ?? 0}
                          onChange={(e) => update({ bgBlur: Number(e.target.value) })}
                          className="w-full accent-[#FFBF24]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- TAB 2: TYPOGRAPHY --- */}
            {activeTab === 'typography' && (
              <div className="space-y-5">
                {/* Font Family */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Font Family
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Inter', label: 'Inter (Modern Sans)', font: 'font-sans' },
                      { id: 'Poppins', label: 'Poppins (Geometric)', font: 'font-heading' },
                      { id: 'Caveat', label: 'Caveat (Handwritten)', font: 'font-handwritten' },
                      { id: 'Fira Code', label: 'Fira Code (Monospace)', font: 'font-mono' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => update({ fontFamily: f.id as any })}
                        className={`p-3 rounded-xl border text-left transition ${
                          appearance.fontFamily === f.id
                            ? 'border-[#FFBF24] bg-[#FFBF24]/10 text-slate-900 dark:text-white font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-sm" style={{ fontFamily: f.id }}>
                          The quick brown fox
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{f.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size & Alignment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Size
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => update({ fontSize: sz })}
                          className={`py-1.5 rounded-lg text-xs font-semibold border uppercase transition ${
                            appearance.fontSize === sz
                              ? 'bg-[#FFBF24] text-slate-900 border-[#FFBF24]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['left', 'center', 'right'] as const).map((al) => (
                        <button
                          key={al}
                          onClick={() => update({ textAlign: al })}
                          className={`py-1.5 rounded-lg text-xs font-semibold border capitalize transition ${
                            appearance.textAlign === al
                              ? 'bg-[#FFBF24] text-slate-900 border-[#FFBF24]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {al}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      { label: 'Midnight', hex: '#0F172A' },
                      { label: 'Slate', hex: '#334155' },
                      { label: 'Ivory White', hex: '#FFFFFF' },
                      { label: 'Amber', hex: '#D97706' },
                      { label: 'Emerald', hex: '#059669' },
                      { label: 'Crimson', hex: '#DC2626' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => update({ textColor: c.hex })}
                        className={`w-8 h-8 rounded-full border-2 transition ${
                          appearance.textColor === c.hex
                            ? 'border-[#FFBF24] ring-2 ring-[#FFBF24]/50 scale-110'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}

                    <input
                      type="color"
                      value={appearance.textColor}
                      onChange={(e) => update({ textColor: e.target.value })}
                      className="w-8 h-8 rounded-full cursor-pointer"
                      title="Custom text color"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 3: CARD STYLING --- */}
            {activeTab === 'card' && (
              <div className="space-y-5">
                {/* Corner Radius */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Corner Radius
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => update({ borderRadius: r })}
                        className={`py-2 rounded-xl text-xs font-semibold border uppercase transition ${
                          appearance.borderRadius === r
                            ? 'bg-[#FFBF24] text-slate-900 border-[#FFBF24]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border width & style */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Border Width
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[0, 1, 2, 3].map((w) => (
                        <button
                          key={w}
                          onClick={() => update({ borderWidth: w })}
                          className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                            appearance.borderWidth === w
                              ? 'bg-[#FFBF24] text-slate-900 border-[#FFBF24]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {w}px
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Border Style
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['solid', 'dashed', 'dotted'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => update({ borderStyle: st })}
                          className={`py-1.5 rounded-lg text-xs font-semibold border capitalize transition ${
                            appearance.borderStyle === st
                              ? 'bg-[#FFBF24] text-slate-900 border-[#FFBF24]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shadow Intensity & Padding */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Shadow Elevation
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['none', 'sm', 'md', 'lg'] as const).map((sh) => (
                        <button
                          key={sh}
                          onClick={() => update({ shadow: sh })}
                          className={`py-1.5 rounded-lg text-xs font-semibold border uppercase transition ${
                            appearance.shadow === sh
                              ? 'bg-[#FFBF24] text-slate-900 border-[#FFBF24]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {sh}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Card Padding
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['compact', 'normal', 'spacious'] as const).map((pd) => (
                        <button
                          key={pd}
                          onClick={() => update({ padding: pd })}
                          className={`py-1.5 rounded-lg text-xs font-semibold border capitalize transition ${
                            appearance.padding === pd
                              ? 'bg-[#FFBF24] text-slate-900 border-[#FFBF24]'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {pd}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 4: PRESETS --- */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 mb-2">
                  Apply a saved styling preset to this note, or save your current creation.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setAppearance({ ...p.appearance })}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#FFBF24] text-left transition flex items-center justify-between group bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <div className="truncate mr-2">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {p.description || 'Custom preset'}
                        </div>
                      </div>
                      <span className="w-5 h-5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: p.appearance.bgColor }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                title="Reset to default note appearance"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowSavePresetInput(!showSavePresetInput)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Save as Preset</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 bg-[#FFBF24] hover:bg-[#F59E0B] text-slate-900 font-bold text-xs rounded-xl shadow-xs transition"
              >
                Apply Style
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Interactive Note Preview */}
        <div className="w-full md:w-2/5 p-6 bg-slate-100 dark:bg-slate-950 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Preview
              </span>
              {hasContrastWarning && (
                <span className="text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Low contrast
                </span>
              )}
            </div>

            {/* Note Card Mock Preview */}
            <div
              className="w-full transition-all duration-200 overflow-hidden relative shadow-md"
              style={{
                backgroundColor: appearance.bgType === 'solid' ? appearance.bgColor : undefined,
                backgroundImage:
                  appearance.bgType === 'gradient'
                    ? appearance.bgGradient
                    : appearance.bgType === 'image' && appearance.bgImageUrl
                    ? `url(${appearance.bgImageUrl})`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius:
                  appearance.borderRadius === 'sm'
                    ? '6px'
                    : appearance.borderRadius === 'md'
                    ? '12px'
                    : appearance.borderRadius === 'lg'
                    ? '16px'
                    : appearance.borderRadius === 'xl'
                    ? '24px'
                    : '32px',
                borderWidth: `${appearance.borderWidth}px`,
                borderColor: appearance.borderColor || '#E2E8F0',
                borderStyle: appearance.borderStyle || 'solid',
                padding:
                  appearance.padding === 'compact'
                    ? '12px'
                    : appearance.padding === 'spacious'
                    ? '24px'
                    : '18px',
                fontFamily: appearance.fontFamily,
                color: appearance.textColor,
                textAlign: appearance.textAlign,
              }}
            >
              {/* Optional overlay for image */}
              {appearance.bgType === 'image' && (
                <div
                  className="absolute inset-0 bg-white dark:bg-black pointer-events-none"
                  style={{
                    opacity: 1 - (appearance.bgOverlayOpacity ?? 0.8),
                    backdropFilter: appearance.bgBlur ? `blur(${appearance.bgBlur}px)` : undefined,
                  }}
                />
              )}

              <div className="relative z-10 space-y-2.5">
                <div
                  className="font-bold tracking-tight font-heading"
                  style={{
                    fontSize:
                      appearance.fontSize === 'sm'
                        ? '1rem'
                        : appearance.fontSize === 'lg'
                        ? '1.25rem'
                        : appearance.fontSize === 'xl'
                        ? '1.5rem'
                        : '1.125rem',
                  }}
                >
                  Project Kickoff Notes 🚀
                </div>

                <p
                  className="leading-relaxed opacity-90"
                  style={{
                    fontSize:
                      appearance.fontSize === 'sm'
                        ? '0.8rem'
                        : appearance.fontSize === 'lg'
                        ? '1rem'
                        : appearance.fontSize === 'xl'
                        ? '1.125rem'
                        : '0.875rem',
                  }}
                >
                  Capture ideas in Sesh@, sync effortlessly with Google Drive, and personalize each note with Note Design Studio!
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/15">
                    #Ideas
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/15">
                    #Creative
                  </span>
                </div>
              </div>
            </div>

            {/* Readability guidance */}
            {hasContrastWarning && (
              <p className="mt-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900 leading-relaxed">
                Suggestion: Adjust the text color or background lightness to maintain optimal reading clarity.
              </p>
            )}
          </div>

          {/* Save Preset inline popup */}
          {showSavePresetInput && (
            <form
              onSubmit={handleSavePreset}
              className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-lg animate-in fade-in"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-white mb-2">
                Name this Appearance Preset
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g. Sunny Minimalist"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newPresetName.trim()}
                  className="px-3 py-1.5 bg-[#FFBF24] disabled:opacity-50 text-slate-900 font-semibold text-xs rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {presetSavedNotice && (
            <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Preset saved successfully to your workspace!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
