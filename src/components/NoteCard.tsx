import React, { useState, useRef } from 'react';
import {
  Pin,
  MoreVertical,
  Check,
  ExternalLink,
  ImageIcon,
  Archive,
  ArchiveRestore,
  Trash2,
  Copy,
  Sparkles,
  Users,
  Star,
  Upload,
  Palette,
  RotateCcw,
  Cloud,
  Code,
  PenTool,
} from 'lucide-react';
import { Note, Label, AppearancePreset, NoteAppearance } from '../types/note';
import {
  getCardColorTokens,
  autoAdjustNoteAppearance,
  getAdaptiveCardStyles,
} from '../utils/contrast';
import { SOLID_PALETTE, GRADIENT_PALETTE } from '../constants/presets';
import { SystemArchitectureDiagram } from './SystemArchitectureDiagram';

interface NoteCardProps {
  note: Note;
  labels: Label[];
  presets?: AppearancePreset[];
  onTogglePin: (id: string) => void;
  onToggleStar?: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreFromTrash?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onOpenDesignStudio: (note: Note) => void;
  onOpenShareModal: (note: Note) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
  onEditNote: (note: Note) => void;
  onUpdateAppearance?: (noteId: string, appearance: NoteAppearance) => void;
  isTrashView?: boolean;
  isDarkMode?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  labels,
  presets = [],
  onTogglePin,
  onToggleStar,
  onToggleArchive,
  onMoveToTrash,
  onRestoreFromTrash,
  onPermanentDelete,
  onDuplicateNote,
  onOpenDesignStudio,
  onOpenShareModal,
  onToggleChecklistItem,
  onEditNote,
  onUpdateAppearance,
  isTrashView = false,
  isDarkMode = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickBgPicker, setShowQuickBgPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { appearance } = note;
  const colorTokens = getAdaptiveCardStyles(appearance, isDarkMode);

  // Format date like "Oct 16, 2026"
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
  };

  // Label badge styling based on name/color
  const primaryLabelId = note.labels[0];
  const primaryLabel = labels.find((l) => l.id === primaryLabelId);
  const labelName = primaryLabel?.name || 'Personal';

  const getLabelBadgeStyle = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('project')) {
      return 'bg-[#DCFCE7] text-[#065F46] dark:bg-[#13382B] dark:text-[#34D399]';
    }
    if (n.includes('personal')) {
      return 'bg-[#FEE2E2] text-[#991B1B] dark:bg-[#3D1B22] dark:text-[#F87171]';
    }
    if (n.includes('college')) {
      return 'bg-[#DBEAFE] text-[#1E40AF] dark:bg-[#182C4A] dark:text-[#60A5FA]';
    }
    if (n.includes('idea')) {
      return 'bg-[#FEF3C7] text-[#854D0E] dark:bg-[#3B3016] dark:text-[#FBBF24]';
    }
    if (n.includes('read')) {
      return 'bg-[#F3E8FF] text-[#6B21A8] dark:bg-[#2E1E46] dark:text-[#C084FC]';
    }
    if (n.includes('finance')) {
      return 'bg-[#CCFBF1] text-[#115E59] dark:bg-[#133838] dark:text-[#2DD4BF]';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  const hasTopCoverImage = note.images && note.images.length > 0;
  const isQuoteCard = !!note.quote;
  const isCodeCard = !!note.codeSnippet;
  const hasDrawings = note.drawings && note.drawings.length > 0;

  // Calculate adaptable note size based on content volume
  const itemsCount = note.items ? note.items.length : 0;
  const textLength = (note.title?.length || 0) + (note.content?.length || 0);
  const isLarge = isCodeCard || hasDrawings || (hasTopCoverImage && itemsCount > 0) || itemsCount >= 5 || textLength > 140;
  const isSmall = !isCodeCard && !hasTopCoverImage && !hasDrawings && itemsCount <= 2 && textLength < 50 && !isQuoteCard;

  const paddingClass = isSmall ? 'p-3.5' : isLarge ? 'p-5' : 'p-4';

  // Apply custom background image upload
  const handleUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAppearance: NoteAppearance = autoAdjustNoteAppearance({
        ...appearance,
        bgType: 'image',
        bgImageUrl: dataUrl,
        bgOverlayOpacity: 0.85,
      });

      if (onUpdateAppearance) {
        onUpdateAppearance(note.id, newAppearance);
      }
      setShowQuickBgPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: AppearancePreset) => {
    if (onUpdateAppearance) {
      onUpdateAppearance(note.id, autoAdjustNoteAppearance(preset.appearance));
    }
    setShowQuickBgPicker(false);
  };

  const handleApplySolid = (color: string) => {
    if (onUpdateAppearance) {
      onUpdateAppearance(
        note.id,
        autoAdjustNoteAppearance({
          ...appearance,
          bgType: 'solid',
          bgColor: color,
        })
      );
    }
    setShowQuickBgPicker(false);
  };

  const handleApplyGradient = (gradient: string) => {
    if (onUpdateAppearance) {
      onUpdateAppearance(
        note.id,
        autoAdjustNoteAppearance({
          ...appearance,
          bgType: 'gradient',
          bgGradient: gradient,
        })
      );
    }
    setShowQuickBgPicker(false);
  };

  return (
    <div
      onClick={() => !isTrashView && onEditNote(note)}
      className={`group relative rounded-2xl border transition-all duration-200 select-none cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
        isSmall ? 'min-h-[110px]' : isLarge ? 'min-h-[220px]' : 'min-h-[150px]'
      }`}
      style={{
        backgroundColor:
          appearance.bgType === 'solid'
            ? colorTokens.bgColor
            : isQuoteCard
            ? 'transparent'
            : colorTokens.bgColor,
        backgroundImage:
          appearance.bgType === 'gradient'
            ? appearance.bgGradient
            : appearance.bgType === 'image' && appearance.bgImageUrl
            ? `url(${appearance.bgImageUrl})`
            : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderColor: colorTokens.borderColor,
      }}
    >
      {/* Background Image Overlay if custom image */}
      {appearance.bgType === 'image' && (
        <div
          className="absolute inset-0 bg-white/75 dark:bg-black/75 pointer-events-none"
          style={{ opacity: 1 - (appearance.bgOverlayOpacity ?? 0.8) }}
        />
      )}

      {/* Top Cover Image if note has image attachment */}
      {hasTopCoverImage && (
        <div className="relative w-full h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={note.images[0].url}
            alt=""
            className="w-full h-full object-cover transition transform group-hover:scale-102 duration-300"
          />
        </div>
      )}

      {/* Quote Card Full Background Image */}
      {isQuoteCard && appearance.bgImageUrl && !hasTopCoverImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={appearance.bgImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
      )}

      {/* Card Content Area */}
      <div className={`relative z-10 ${paddingClass} flex-1 flex flex-col justify-between`}>
        <div>
          {/* Header row: Title + Actions (Star, Pin, Palette, Menu) */}
          {!isQuoteCard && (
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4
                className={`font-bold font-heading leading-snug break-words flex-1 ${
                  isSmall ? 'text-xs' : 'text-sm'
                }`}
                style={{ color: colorTokens.titleColor }}
              >
                {note.title || 'Untitled Note'}
              </h4>

              <div
                className="flex items-center gap-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Star Button */}
                {!isTrashView && onToggleStar && (
                  <button
                    type="button"
                    onClick={() => onToggleStar(note.id)}
                    className={`p-1 rounded-md transition ${
                      note.isStarred
                        ? 'text-[#F59E0B] opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                    style={{
                      color: note.isStarred ? '#F59E0B' : colorTokens.secondaryColor,
                    }}
                    title={note.isStarred ? 'Unstar' : 'Star'}
                  >
                    <Star className={`w-3.5 h-3.5 ${note.isStarred ? 'fill-current' : ''}`} />
                  </button>
                )}

                {/* Pin button */}
                {!isTrashView && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(note.id)}
                    className={`p-1 rounded-md transition ${
                      note.isPinned
                        ? 'text-[#F59E0B] opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                    style={{
                      color: note.isPinned ? '#F59E0B' : colorTokens.secondaryColor,
                    }}
                    title={note.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                  </button>
                )}

                {/* Quick Background Customizer Button with Presets */}
                {!isTrashView && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickBgPicker(!showQuickBgPicker);
                      setShowMenu(false);
                    }}
                    className="p-1 rounded-md transition opacity-0 group-hover:opacity-100"
                    style={{ color: colorTokens.secondaryColor }}
                    title="Customize Background & Presets"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* 3-dots Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(!showMenu);
                      setShowQuickBgPicker(false);
                    }}
                    className="p-1 rounded-md transition"
                    style={{ color: colorTokens.secondaryColor }}
                    title="More actions"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* 3-dots Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-6 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-40 animate-in fade-in text-xs">
                      {onToggleStar && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            onToggleStar(note.id);
                          }}
                          className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Star className={`w-3.5 h-3.5 ${note.isStarred ? 'text-[#F59E0B] fill-current' : ''}`} />
                          <span>{note.isStarred ? 'Unstar Note' : 'Star Note'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowQuickBgPicker(true);
                        }}
                        className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <Palette className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>Change Background</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <Upload className="w-3.5 h-3.5 text-teal-500" />
                        <span>Upload Custom Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onOpenDesignStudio(note);
                        }}
                        className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>Open Design Studio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onOpenShareModal(note);
                        }}
                        className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>Share Note</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onDuplicateNote(note.id);
                        }}
                        className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onToggleArchive(note.id);
                        }}
                        className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        {note.isArchived ? (
                          <>
                            <ArchiveRestore className="w-3.5 h-3.5" />
                            <span>Unarchive</span>
                          </>
                        ) : (
                          <>
                            <Archive className="w-3.5 h-3.5" />
                            <span>Archive</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onMoveToTrash(note.id);
                        }}
                        className="w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Move to Trash</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Background Customizer Popover (Presets + Custom Upload + Colors) */}
          {showQuickBgPicker && !isTrashView && (
            <div
              className="absolute left-2 right-2 top-10 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 z-40 animate-in fade-in space-y-3 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                  Quick Background & Presets
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-semibold text-[#D97706] dark:text-[#FBBF24] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Image</span>
                </button>
              </div>

              {/* Presets List */}
              {presets.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Theme Presets
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition text-[11px]"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                          style={{
                            background:
                              preset.appearance.bgType === 'gradient'
                                ? preset.appearance.bgGradient
                                : preset.appearance.bgColor || '#FFF',
                          }}
                        />
                        <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Solid Color Circles */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Colors
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  {SOLID_PALETTE.slice(0, 8).map((col) => (
                    <button
                      key={col.color}
                      type="button"
                      onClick={() => handleApplySolid(col.color)}
                      className={`w-6 h-6 rounded-full shrink-0 border transition transform hover:scale-110 ${
                        appearance.bgColor === col.color ? 'ring-2 ring-offset-1 ring-[#FFBF24]' : 'border-black/10'
                      }`}
                      style={{ backgroundColor: col.color }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              {/* Gradients */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Gradients
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  {GRADIENT_PALETTE.slice(0, 6).map((grad) => (
                    <button
                      key={grad.name}
                      type="button"
                      onClick={() => handleApplyGradient(grad.gradient)}
                      className="w-10 h-6 rounded-lg shrink-0 border border-black/10 transition transform hover:scale-105"
                      style={{ background: grad.gradient }}
                      title={grad.name}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickBgPicker(false);
                    onOpenDesignStudio(note);
                  }}
                  className="text-[11px] text-[#F59E0B] font-semibold hover:underline"
                >
                  Full Design Studio →
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickBgPicker(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input for Custom Background Image Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadBg}
            className="hidden"
          />

          {/* Quote Card Display */}
          {isQuoteCard && (
            <div className="py-8 px-2 text-center">
              <p
                className="text-base font-semibold italic tracking-wide"
                style={{ color: colorTokens.titleColor }}
              >
                {note.quote}
              </p>
            </div>
          )}

          {/* Checklist Items */}
          {note.items && note.items.length > 0 && (
            <div className="space-y-1.5 mb-2.5" onClick={(e) => e.stopPropagation()}>
              {note.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    disabled={isTrashView}
                    onClick={() => onToggleChecklistItem(note.id, item.id)}
                    className={`w-4 h-4 rounded-md flex items-center justify-center transition border shrink-0 ${
                      item.completed
                        ? note.title?.toLowerCase().includes('grocery')
                          ? 'bg-[#F87171] border-[#F87171] text-white'
                          : 'bg-[#34D399] border-[#34D399] text-white'
                        : colorTokens.isDark
                        ? 'border-white/40 hover:border-white'
                        : 'border-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    className={`break-words ${item.completed ? 'line-through opacity-50' : ''}`}
                    style={{
                      color: item.completed ? colorTokens.mutedColor : colorTokens.bodyColor,
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Code Snippet (e.g. Docker Commands) */}
          {isCodeCard && note.codeSnippet && (
            <div className="bg-[#0D1117] text-slate-200 rounded-xl p-3 text-xs font-mono mb-2.5 space-y-1 overflow-x-auto">
              {note.codeSnippet.code.split('\n').map((line, idx) => {
                if (line.startsWith('#')) {
                  return (
                    <div key={idx} className="text-[#34D399]">
                      {line}
                    </div>
                  );
                }
                const parts = line.split(' ');
                return (
                  <div key={idx}>
                    <span className="text-[#FBBF24] font-semibold">{parts[0]}</span>{' '}
                    <span>{parts.slice(1).join(' ')}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Drawing Canvas Preview */}
          {hasDrawings && (
            <div className="my-2 rounded-xl overflow-hidden border border-black/10 bg-white/40 backdrop-blur-xs">
              <img
                src={note.drawings[0].previewUrl}
                alt="Drawing"
                className="w-full h-32 object-contain"
              />
            </div>
          )}

          {/* System Architecture Diagram matching reference */}
          {(note.id === 'note_arch' || note.title?.toLowerCase().includes('architecture')) && (
            <div onClick={(e) => e.stopPropagation()}>
              <SystemArchitectureDiagram isDarkMode={isDarkMode} />
            </div>
          )}

          {/* Important Links List */}
          {note.links && note.links.length > 0 && (
            <div className="space-y-1.5 mb-2.5" onClick={(e) => e.stopPropagation()}>
              {note.links.map((link, idx) => {
                const titleLower = link.title.toLowerCase();
                const LinkIcon =
                  titleLower.includes('aws') || titleLower.includes('cloud')
                    ? Cloud
                    : titleLower.includes('python') || titleLower.includes('doc')
                    ? Code
                    : titleLower.includes('figma') || titleLower.includes('design')
                    ? PenTool
                    : ExternalLink;

                return (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs hover:underline"
                    style={{ color: colorTokens.isDark ? '#93C5FD' : '#2563EB' }}
                  >
                    <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{link.title}</span>
                  </a>
                );
              })}
            </div>
          )}

          {/* Standard Text Content */}
          {note.content && !isCodeCard && !isQuoteCard && (
            <p
              className={`leading-relaxed mb-2.5 break-words whitespace-pre-line ${
                isSmall ? 'text-xs line-clamp-2' : 'text-xs'
              }`}
              style={{ color: colorTokens.bodyColor }}
            >
              {note.content}
            </p>
          )}

          {/* Image count badge if top cover image */}
          {hasTopCoverImage && (
            <div
              className="flex items-center gap-1.5 text-[11px] mb-2"
              style={{ color: colorTokens.secondaryColor }}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>
                {note.images.length} {note.images.length === 1 ? 'image' : 'images'}
              </span>
            </div>
          )}
        </div>

        {/* Footer: Category Pill on Left + Date on Right */}
        <div
          className="mt-2 pt-2 flex items-center justify-between text-xs"
          style={{
            borderTop: `1px solid ${colorTokens.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
              colorTokens.isDark
                ? getLabelBadgeStyle(labelName).replace(/bg-\[#[A-F0-9]+\]/g, '').replace('dark:', '')
                : getLabelBadgeStyle(labelName)
            }`}
          >
            {labelName}
          </span>

          {/* Trash actions or Date */}
          {isTrashView ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {onRestoreFromTrash && (
                <button
                  type="button"
                  onClick={() => onRestoreFromTrash(note.id)}
                  className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[11px] font-medium flex items-center gap-1 px-2 transition"
                  title="Restore note"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              )}
              {onPermanentDelete && (
                <button
                  type="button"
                  onClick={() => onPermanentDelete(note.id)}
                  className="p-1 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-[11px] font-medium flex items-center gap-1 px-2 transition"
                  title="Delete permanently"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          ) : (
            <span
              className="text-[11px]"
              style={{ color: colorTokens.secondaryColor }}
            >
              {formatDate(note.createdAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
