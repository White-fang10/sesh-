import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  List,
  Image as ImageIcon,
  Palette,
  Plus,
  Pin,
  Sparkles,
  Tag,
  Trash2,
  X,
  Upload,
  Code,
} from 'lucide-react';
import { CodeBlockEditor } from './CodeBlock';
import {
  Note,
  NoteType,
  ChecklistItem,
  DrawingData,
  NoteImage,
  NoteAppearance,
  AppearancePreset,
  Label,
} from '../types/note';
import {
  DEFAULT_NOTE_APPEARANCE,
  getRandomNoteAppearance,
  SOLID_PALETTE,
  GRADIENT_PALETTE,
  SYSTEM_PRESETS,
} from '../constants/presets';
import {
  autoAdjustNoteAppearance,
  getContrastingTextColor,
  getCardColorTokens,
} from '../utils/contrast';
import { driveService } from '../services/driveService';

interface NoteComposerProps {
  onSaveNote: (noteData: Partial<Note>) => void;
  onOpenDrawingModal: (
    initialDrawing?: DrawingData,
    onSave?: (d: DrawingData) => void
  ) => void;
  onOpenDesignStudio: (
    currentAppearance: NoteAppearance,
    onApply: (app: NoteAppearance) => void
  ) => void;
  labels: Label[];
  presets?: AppearancePreset[];
  isDarkMode?: boolean;
}

export const NoteComposer: React.FC<NoteComposerProps> = ({
  onSaveNote,
  onOpenDrawingModal,
  onOpenDesignStudio,
  labels,
  presets = [],
  isDarkMode = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [drawings, setDrawings] = useState<DrawingData[]>([]);
  const [images, setImages] = useState<NoteImage[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState<{ language: string; code: string } | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  // Background appearance: if user manually selects or uploads, userCustomizedBg becomes true
  const [userCustomizedBg, setUserCustomizedBg] = useState(false);
  const [appearance, setAppearance] = useState<NoteAppearance>(() =>
    getRandomNoteAppearance(isDarkMode)
  );

  const effectivePresets = presets && presets.length > 0 ? presets : SYSTEM_PRESETS;
  const colorTokens = getCardColorTokens(appearance);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageUploadRef = useRef<HTMLInputElement | null>(null);
  const bgUploadRef = useRef<HTMLInputElement | null>(null);

  // Handle outside click to collapse if empty
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        isExpanded
      ) {
        if (
          !title.trim() &&
          !content.trim() &&
          items.length === 0 &&
          drawings.length === 0 &&
          images.length === 0 &&
          !codeSnippet?.code.trim()
        ) {
          handleReset();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, title, content, items, drawings, images, codeSnippet]);

  const handleReset = () => {
    setTitle('');
    setContent('');
    setIsPinned(false);
    setItems([]);
    setNewItemText('');
    setDrawings([]);
    setImages([]);
    setSelectedLabels([]);
    setCodeSnippet(null);
    setShowCodeEditor(false);
    setUserCustomizedBg(false);
    setAppearance(getRandomNoteAppearance(isDarkMode));
    setShowLabelPicker(false);
    setShowBgPicker(false);
    setIsExpanded(false);
  };

  const handleSave = () => {
    if (
      !title.trim() &&
      !content.trim() &&
      items.length === 0 &&
      drawings.length === 0 &&
      images.length === 0 &&
      !codeSnippet?.code.trim()
    ) {
      handleReset();
      return;
    }

    // If user hasn't chosen a background, randomly generate one automatically
    const finalAppearance = userCustomizedBg
      ? appearance
      : getRandomNoteAppearance(isDarkMode);

    // Determine type
    let finalType: NoteType = 'text';
    if (codeSnippet?.code.trim()) {
      finalType = 'code';
    } else if (items.length > 0 && (drawings.length > 0 || images.length > 0 || content)) {
      finalType = 'mixed';
    } else if (items.length > 0) {
      finalType = 'checklist';
    } else if (drawings.length > 0) {
      finalType = 'drawing';
    }

    onSaveNote({
      title: title.trim(),
      content: content.trim(),
      type: finalType,
      items,
      drawings,
      images,
      labels: selectedLabels,
      isPinned,
      appearance: finalAppearance,
      codeSnippet: codeSnippet && codeSnippet.code.trim() ? codeSnippet : undefined,
    });

    handleReset();
  };

  // Checklist
  const handleAddChecklistItem = (e?: React.FormEvent) => {
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

  // Upload Custom Background Image
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAppearance((prev) => ({
        ...prev,
        bgType: 'image',
        bgImageUrl: dataUrl,
        bgOverlayOpacity: 0.85,
        textColor: '#0F172A',
      }));
      setUserCustomizedBg(true);
    };
    reader.readAsDataURL(file);
  };

  // Upload Note Attachment Image
  const handleAttachmentImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
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

  return (
    <div className="w-full max-w-4xl mx-auto mb-6" ref={containerRef}>
      {!isExpanded ? (
        /* Collapsed bar matching reference */
        <div
          onClick={() => setIsExpanded(true)}
          className="bg-white dark:bg-[#121826] rounded-2xl shadow-xs hover:shadow-md border border-slate-200/80 dark:border-slate-800/80 px-5 py-3.5 flex items-center justify-between cursor-text transition-all group"
        >
          <span className="text-sm text-slate-400 dark:text-slate-500 font-normal">
            Take a note...
          </span>

          <div
            className="flex items-center gap-2 text-slate-400 dark:text-slate-400"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image / Custom Background Icon */}
            <button
              onClick={() => {
                setIsExpanded(true);
                imageUploadRef.current?.click();
              }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
              title="Add Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Checklist Icon */}
            <button
              onClick={() => {
                setIsExpanded(true);
                if (items.length === 0) {
                  setItems([{ id: 'it_1', text: '', completed: false, order: 0 }]);
                }
              }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
              title="New Checklist"
            >
              <CheckSquare className="w-4 h-4" />
            </button>

            {/* Code Block Icon */}
            <button
              onClick={() => {
                setIsExpanded(true);
                setShowCodeEditor(true);
                if (!codeSnippet) {
                  setCodeSnippet({ language: 'javascript', code: '' });
                }
              }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
              title="Add Code Block"
            >
              <Code className="w-4 h-4" />
            </button>

            {/* List Icon */}
            <button
              onClick={() => {
                setIsExpanded(true);
                onOpenDrawingModal(undefined, (d) => {
                  setDrawings((prev) => [...prev, d]);
                });
              }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
              title="Drawing Canvas"
            >
              <List className="w-4 h-4" />
            </button>

            {/* Palette / Design Studio */}
            <button
              onClick={() => {
                setIsExpanded(true);
                setShowBgPicker(!showBgPicker);
              }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
              title="Note Background"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Orange/Yellow circular plus button matching reference */}
            <button
              onClick={() => setIsExpanded(true)}
              className="w-8 h-8 rounded-full bg-[#FFBF24] hover:bg-[#F59E0B] text-white flex items-center justify-center font-bold shadow-xs transition transform hover:scale-105 ml-1"
              title="Create note"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Note Composer */
        <div
          className="rounded-2xl shadow-xl border transition-all overflow-hidden relative"
          style={{
            backgroundColor:
              appearance.bgType === 'solid'
                ? appearance.bgColor
                : isDarkMode
                ? '#121826'
                : '#FFFFFF',
            backgroundImage:
              appearance.bgType === 'gradient'
                ? appearance.bgGradient
                : appearance.bgType === 'image' && appearance.bgImageUrl
                ? `url(${appearance.bgImageUrl})`
                : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderColor: appearance.borderColor || '#E2E8F0',
          }}
        >
          {appearance.bgType === 'image' && (
            <div
              className="absolute inset-0 bg-white/70 dark:bg-black/70 pointer-events-none"
              style={{ opacity: 1 - (appearance.bgOverlayOpacity ?? 0.8) }}
            />
          )}

          <div className="relative z-10 p-5">
            {/* Title & Pin row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-transparent text-base font-bold placeholder-slate-400 focus:outline-none font-heading"
                style={{ color: appearance.textColor }}
              />
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1.5 rounded-lg transition ${
                  isPinned
                    ? 'text-[#F59E0B] bg-amber-100/50 dark:bg-amber-950/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Note text content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take a note..."
              rows={3}
              className="w-full bg-transparent text-sm placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
              style={{ color: appearance.textColor }}
            />

            {/* Code Block Editor */}
            {showCodeEditor && codeSnippet && (
              <CodeBlockEditor
                code={codeSnippet.code}
                language={codeSnippet.language}
                onChangeCode={(code) => setCodeSnippet((prev) => ({ ...prev!, code }))}
                onChangeLanguage={(language) => setCodeSnippet((prev) => ({ ...prev!, language }))}
                onRemove={() => {
                  setCodeSnippet(null);
                  setShowCodeEditor(false);
                }}
              />
            )}

            {/* Checklist items */}
            {items.length > 0 && (
              <div className="my-2.5 space-y-1.5 border-t border-black/10 dark:border-white/10 pt-2.5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        setItems((prev) =>
                          prev.map((i) =>
                            i.id === item.id ? { ...i, completed: !i.completed } : i
                          )
                        )
                      }
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem();
                        }
                      }}
                      placeholder="List item..."
                      className={`flex-1 text-xs bg-transparent focus:outline-none ${
                        item.completed ? 'line-through opacity-50' : ''
                      }`}
                      style={{ color: appearance.textColor }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setItems((prev) => prev.filter((i) => i.id !== item.id))
                      }
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2 pt-1">
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Add an item... (press Enter)"
                    className="flex-1 text-xs bg-transparent focus:outline-none placeholder-slate-400"
                    style={{ color: appearance.textColor }}
                  />
                </form>
              </div>
            )}

            {/* Drawing Preview */}
            {drawings.length > 0 && (
              <div className="my-2.5 grid grid-cols-2 gap-2">
                {drawings.map((draw, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs"
                  >
                    <img
                      src={draw.previewUrl}
                      alt="Drawing"
                      className="w-full h-32 object-contain"
                    />
                    <button
                      onClick={() =>
                        setDrawings((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1 right-1 p-1 bg-white/90 text-rose-600 rounded-lg shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Images Preview */}
            {images.length > 0 && (
              <div className="my-2.5 grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative rounded-xl border border-slate-200 overflow-hidden h-24"
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() =>
                        setImages((prev) => prev.filter((i) => i.id !== img.id))
                      }
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected labels */}
            {selectedLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 my-2">
                {selectedLabels.map((lblId) => {
                  const lbl = labels.find((l) => l.id === lblId);
                  return (
                    <span
                      key={lblId}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10"
                      style={{ color: appearance.textColor }}
                    >
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

            {/* Custom Background Quick Picker with Presets and Auto-Contrast */}
            {showBgPicker && (
              <div className="my-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Customize Background
                  </span>
                  <button
                    type="button"
                    onClick={() => bgUploadRef.current?.click()}
                    className="text-xs font-semibold text-[#D97706] dark:text-[#FBBF24] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Background</span>
                  </button>
                </div>

                {/* Quick Presets Section */}
                {effectivePresets.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Presets
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
                      {effectivePresets.slice(0, 10).map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            const adjusted = autoAdjustNoteAppearance(preset.appearance);
                            setAppearance(adjusted);
                            setUserCustomizedBg(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border text-left shrink-0 transition hover:scale-102 flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
                          style={{
                            backgroundColor:
                              preset.appearance.bgType === 'solid'
                                ? preset.appearance.bgColor
                                : '#FFFFFF',
                            backgroundImage:
                              preset.appearance.bgType === 'gradient'
                                ? preset.appearance.bgGradient
                                : undefined,
                            borderColor: preset.appearance.borderColor || '#E2E8F0',
                            color: getContrastingTextColor(
                              preset.appearance.bgGradient || preset.appearance.bgColor
                            ),
                          }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: preset.appearance.bgColor }}
                          />
                          <span className="truncate max-w-[100px]">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Solid Colors Section with Auto Contrast */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Colors
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {SOLID_PALETTE.map((p) => {
                      const textColor = getContrastingTextColor(p.color);
                      return (
                        <button
                          key={p.color}
                          type="button"
                          onClick={() => {
                            setAppearance((prev) =>
                              autoAdjustNoteAppearance({
                                ...prev,
                                bgType: 'solid',
                                bgColor: p.color,
                                textColor,
                              })
                            );
                            setUserCustomizedBg(true);
                          }}
                          className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-slate-700 shrink-0 transition transform hover:scale-115 cursor-pointer shadow-2xs"
                          style={{ backgroundColor: p.color }}
                          title={`${p.name} (Auto-contrasted text)`}
                        />
                      );
                    })}

                    <button
                      type="button"
                      onClick={() =>
                        onOpenDesignStudio(appearance, (app) => {
                          const adjusted = autoAdjustNoteAppearance(app);
                          setAppearance(adjusted);
                          setUserCustomizedBg(true);
                        })
                      }
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-200 shrink-0 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Studio</span>
                    </button>
                  </div>
                </div>

                {/* Gradients */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Gradients
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {GRADIENT_PALETTE.map((g) => (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => {
                          setAppearance((prev) =>
                            autoAdjustNoteAppearance({
                              ...prev,
                              bgType: 'gradient',
                              bgGradient: g.gradient,
                            })
                          );
                          setUserCustomizedBg(true);
                        }}
                        className="px-3 py-1 rounded-lg border border-black/10 text-xs font-semibold text-slate-800 shrink-0 transition hover:scale-105"
                        style={{ background: g.gradient }}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Add Checklist */}
                <button
                  type="button"
                  onClick={() => {
                    if (items.length === 0) {
                      setItems([{ id: 'it_' + Date.now(), text: '', completed: false, order: 0 }]);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5"
                  title="Checklist"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>

                {/* Code Block Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (showCodeEditor) {
                      if (!codeSnippet?.code.trim()) {
                        setCodeSnippet(null);
                        setShowCodeEditor(false);
                      } else {
                        setShowCodeEditor(false);
                      }
                    } else {
                      setShowCodeEditor(true);
                      if (!codeSnippet) {
                        setCodeSnippet({ language: 'javascript', code: '' });
                      }
                    }
                  }}
                  className={`p-1.5 rounded-lg transition ${
                    showCodeEditor || codeSnippet?.code
                      ? 'text-[#F59E0B] bg-amber-100/50 dark:bg-amber-950/40'
                      : 'text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5'
                  }`}
                  title="Insert Code Block"
                >
                  <Code className="w-4 h-4" />
                </button>

                {/* Add Drawing */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenDrawingModal(undefined, (d) => {
                      setDrawings((prev) => [...prev, d]);
                    })
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5"
                  title="Drawing"
                >
                  <List className="w-4 h-4" />
                </button>

                {/* Add Attachment Image */}
                <button
                  type="button"
                  onClick={() => imageUploadRef.current?.click()}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5"
                  title="Attach Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Background & Design Studio */}
                <button
                  type="button"
                  onClick={() => setShowBgPicker(!showBgPicker)}
                  className="p-1.5 text-slate-500 hover:text-[#F59E0B] rounded-lg hover:bg-black/5"
                  title="Customize Background"
                >
                  <Palette className="w-4 h-4" />
                </button>

                {/* Labels selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLabelPicker(!showLabelPicker)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5"
                    title="Labels"
                  >
                    <Tag className="w-4 h-4" />
                  </button>

                  {showLabelPicker && (
                    <div className="absolute left-0 bottom-9 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in">
                      <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                        Select Label
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
                            {isSelected && <X className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Close & Save Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-[#FFBF24] hover:bg-[#F59E0B] text-slate-900 font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Hidden file inputs for attachment image and custom background */}
          <input
            ref={imageUploadRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAttachmentImage}
          />
          <input
            ref={bgUploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCustomBgUpload}
          />
        </div>
      )}
    </div>
  );
};
