import React, { useState, useRef } from 'react';
import {
  Pin,
  Sparkles,
  Archive,
  ArchiveRestore,
  Trash2,
  Users,
  Tag,
  CheckSquare,
  PenTool,
  Image as ImageIcon,
  Plus,
  X,
  Check,
  Palette,
  Upload,
} from 'lucide-react';
import {
  Note,
  ChecklistItem,
  DrawingData,
  NoteImage,
  NoteAppearance,
  Label,
  AppearancePreset,
} from '../types/note';
import { getCardColorTokens, autoAdjustNoteAppearance } from '../utils/contrast';
import { SOLID_PALETTE, GRADIENT_PALETTE } from '../constants/presets';
import { driveService } from '../services/driveService';

interface NoteEditorModalProps {
  note: Note;
  labels: Label[];
  presets?: AppearancePreset[];
  isOpen: boolean;
  onUpdateNote: (updatedNote: Note) => void;
  onOpenDrawingModal: (
    initialDrawing?: DrawingData,
    onSave?: (d: DrawingData) => void
  ) => void;
  onOpenDesignStudio: (
    currentAppearance: NoteAppearance,
    onApply: (app: NoteAppearance) => void
  ) => void;
  onOpenShareModal: (note: Note) => void;
  onMoveToTrash: (id: string) => void;
  onClose: () => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  labels,
  presets = [],
  isOpen,
  onUpdateNote,
  onOpenDrawingModal,
  onOpenDesignStudio,
  onOpenShareModal,
  onMoveToTrash,
  onClose,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [items, setItems] = useState<ChecklistItem[]>(note.items || []);
  const [newItemText, setNewItemText] = useState('');
  const [drawings, setDrawings] = useState<DrawingData[]>(note.drawings || []);
  const [images, setImages] = useState<NoteImage[]>(note.images || []);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(note.labels || []);
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [isArchived, setIsArchived] = useState(note.isArchived);
  const [appearance, setAppearance] = useState<NoteAppearance>(note.appearance);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgUploadRef = useRef<HTMLInputElement | null>(null);

  const colorTokens = getCardColorTokens(appearance);

  const handleSaveAndClose = () => {
    onUpdateNote({
      ...note,
      title: title.trim(),
      content: content.trim(),
      items,
      drawings,
      images,
      labels: selectedLabels,
      isPinned,
      isArchived,
      appearance,
      updatedAt: Date.now(),
      version: note.version + 1,
    });
    onClose();
  };

  // Checklist actions
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemText.trim()) return;
    const item: ChecklistItem = {
      id: 'item_' + Date.now() + Math.random().toString(36).substring(2, 6),
      text: newItemText.trim(),
      completed: false,
      order: items.length,
    };
    setItems((prev) => [...prev, item]);
    setNewItemText('');
  };

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Attachment Image actions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      const imgId = 'img_' + Date.now() + '_' + i;
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImages((prev) => [
          ...prev,
          {
            id: imgId,
            url: dataUrl,
            name: file.name,
            sizeBytes: file.size,
          },
        ]);

        // Attempt background upload to Google Drive if authorized
        driveService
          .uploadImageToDrive(file, file.name)
          .then((res) => {
            if (res.fileId) {
              setImages((prev) =>
                prev.map((img) =>
                  img.id === imgId
                    ? {
                        ...img,
                        driveFileId: res.fileId,
                        url: res.webViewLink || img.url,
                      }
                    : img
                )
              );
            }
          })
          .catch(() => {
            // Keep local cached preview
          });
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom Background Image Upload
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated = autoAdjustNoteAppearance({
        ...appearance,
        bgType: 'image',
        bgImageUrl: dataUrl,
        bgOverlayOpacity: 0.85,
      });
      setAppearance(updated);
      setShowBgPicker(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={handleSaveAndClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border transition-all flex flex-col overflow-hidden"
        style={{
          backgroundColor:
            appearance.bgType === 'solid' ? appearance.bgColor : '#FFFFFF',
          backgroundImage:
            appearance.bgType === 'gradient'
              ? appearance.bgGradient
              : appearance.bgType === 'image' && appearance.bgImageUrl
              ? `url(${appearance.bgImageUrl})`
              : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderColor: colorTokens.borderColor,
          fontFamily: appearance.fontFamily,
          color: colorTokens.bodyColor,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlay for background images */}
        {appearance.bgType === 'image' && (
          <div
            className="absolute inset-0 bg-white/80 dark:bg-black/80 pointer-events-none"
            style={{
              opacity: 1 - (appearance.bgOverlayOpacity ?? 0.8),
              backdropFilter: appearance.bgBlur ? `blur(${appearance.bgBlur}px)` : undefined,
            }}
          />
        )}

        {/* Modal Header: Title & Pin */}
        <div className="relative z-10 p-5 pb-2 flex items-center justify-between gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-lg font-bold placeholder-slate-400 focus:outline-none font-heading"
            style={{ color: colorTokens.titleColor }}
          />
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2 rounded-xl transition shrink-0 ${
              isPinned
                ? 'text-[#F59E0B] bg-amber-100/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 pt-0 space-y-4 custom-scrollbar">
          {/* Text content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Take a note..."
            rows={4}
            className="w-full bg-transparent text-sm placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            style={{ color: colorTokens.bodyColor }}
          />

          {/* Checklist Editor */}
          {items.length > 0 && (
            <div className="space-y-2 border-t border-black/10 dark:border-white/10 pt-3">
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: colorTokens.secondaryColor }}
              >
                Checklist
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleItem(item.id)}
                    className="w-4 h-4 accent-[#FFBF24] rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItems((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, text: val } : i))
                      );
                    }}
                    className={`flex-1 text-sm bg-transparent focus:outline-none ${
                      item.completed ? 'line-through opacity-50' : ''
                    }`}
                    style={{
                      color: item.completed ? colorTokens.mutedColor : colorTokens.bodyColor,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add checklist item form */}
          <form onSubmit={handleAddItem} className="flex items-center gap-2 pt-1">
            <Plus className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add checklist item..."
              className="flex-1 text-xs bg-transparent focus:outline-none placeholder-slate-400"
              style={{ color: colorTokens.bodyColor }}
            />
          </form>

          {/* Drawings Preview */}
          {drawings.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {drawings.map((draw, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-slate-200 overflow-hidden bg-white/50 backdrop-blur-xs p-1"
                >
                  <img
                    src={draw.previewUrl}
                    alt="Drawing"
                    className="w-full h-36 object-contain"
                  />
                  <button
                    onClick={() =>
                      setDrawings((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-600 rounded-lg shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Images Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative rounded-2xl border border-slate-200 overflow-hidden h-32 group"
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() =>
                      setImages((prev) => prev.filter((i) => i.id !== img.id))
                    }
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Labels chips */}
          {selectedLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedLabels.map((lblId) => {
                const lbl = labels.find((l) => l.id === lblId);
                return (
                  <span
                    key={lblId}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-black/5 dark:bg-white/10"
                    style={{ color: colorTokens.bodyColor }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: lbl?.color || '#F87171' }}
                    />
                    <span>{lbl?.name || 'label'}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedLabels((prev) => prev.filter((id) => id !== lblId))
                      }
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Quick Background Customizer with Presets and Upload */}
          {showBgPicker && (
            <div
              className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                  Quick Background & Presets
                </span>
                <button
                  type="button"
                  onClick={() => bgUploadRef.current?.click()}
                  className="text-xs font-semibold text-[#D97706] dark:text-[#FBBF24] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
              </div>

              {/* Presets */}
              {presets.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Theme Presets
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setAppearance(autoAdjustNoteAppearance(p.appearance));
                          setShowBgPicker(false);
                        }}
                        className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition text-xs"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                          style={{
                            background:
                              p.appearance.bgType === 'gradient'
                                ? p.appearance.bgGradient
                                : p.appearance.bgColor || '#FFF',
                          }}
                        />
                        <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Solid Colors */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Colors
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  {SOLID_PALETTE.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        setAppearance(
                          autoAdjustNoteAppearance({
                            ...appearance,
                            bgType: 'solid',
                            bgColor: c.color,
                          })
                        );
                        setShowBgPicker(false);
                      }}
                      className={`w-7 h-7 rounded-full shrink-0 border-2 transition transform hover:scale-115 ${
                        appearance.bgColor === c.color
                          ? 'border-[#FFBF24] ring-2 ring-[#FFBF24]/50'
                          : 'border-black/10'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Gradients */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Gradients
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {GRADIENT_PALETTE.map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => {
                        setAppearance(
                          autoAdjustNoteAppearance({
                            ...appearance,
                            bgType: 'gradient',
                            bgGradient: g.gradient,
                          })
                        );
                        setShowBgPicker(false);
                      }}
                      className="px-2.5 py-1 rounded-lg shrink-0 border border-black/10 text-[11px] font-semibold text-slate-800"
                      style={{ background: g.gradient }}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="relative z-10 p-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Checklist */}
            <button
              type="button"
              onClick={() => {
                if (items.length === 0) {
                  setItems([{ id: 'it_1', text: '', completed: false, order: 0 }]);
                }
              }}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5 transition"
              title="Add Checklist"
            >
              <CheckSquare className="w-4 h-4" />
            </button>

            {/* Add Drawing */}
            <button
              type="button"
              onClick={() =>
                onOpenDrawingModal(undefined, (d) => {
                  setDrawings((prev) => [...prev, d]);
                })
              }
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5 transition"
              title="Add Drawing"
            >
              <PenTool className="w-4 h-4" />
            </button>

            {/* Add Image Attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5 transition"
              title="Upload Attachment Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Quick Background Picker */}
            <button
              type="button"
              onClick={() => setShowBgPicker(!showBgPicker)}
              className="p-2 text-[#F59E0B] hover:text-[#D97706] rounded-lg hover:bg-amber-100/50 transition"
              title="Change Background & Presets"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Full Design Studio */}
            <button
              type="button"
              onClick={() =>
                onOpenDesignStudio(appearance, (newApp) =>
                  setAppearance(autoAdjustNoteAppearance(newApp))
                )
              }
              className="p-2 text-[#D97706] hover:text-[#B45309] rounded-lg hover:bg-amber-100/50 transition"
              title="Full Design Studio"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Share Note */}
            <button
              type="button"
              onClick={() => onOpenShareModal(note)}
              className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-black/5 transition"
              title="Share Note"
            >
              <Users className="w-4 h-4" />
            </button>

            {/* Archive */}
            <button
              type="button"
              onClick={() => setIsArchived(!isArchived)}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5 transition"
              title={isArchived ? 'Unarchive' : 'Archive'}
            >
              {isArchived ? (
                <ArchiveRestore className="w-4 h-4" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
            </button>

            {/* Labels menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5 transition"
                title="Labels"
              >
                <Tag className="w-4 h-4" />
              </button>

              {showLabelPicker && (
                <div className="absolute left-0 bottom-9 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase">
                    Select Labels
                  </div>
                  {labels.map((lbl) => {
                    const isSelected = selectedLabels.includes(lbl.id);
                    return (
                      <button
                        key={lbl.id}
                        type="button"
                        onClick={() => {
                          setSelectedLabels((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== lbl.id)
                              : [...prev, lbl.id]
                          );
                        }}
                        className="w-full px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <span>{lbl.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Move to Trash */}
            <button
              type="button"
              onClick={() => {
                onMoveToTrash(note.id);
                onClose();
              }}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-5 py-2 bg-[#FFBF24] hover:bg-[#F59E0B] text-slate-900 font-bold text-xs rounded-xl shadow-xs transition"
          >
            Done
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={bgUploadRef}
          type="file"
          accept="image/*"
          onChange={handleCustomBgUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};
