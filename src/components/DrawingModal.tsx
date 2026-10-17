import React, { useRef, useState, useEffect } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  RotateCcw,
  Download,
  Check,
  X,
  Grid,
  AlignLeft,
  CircleDot,
  Minus,
} from 'lucide-react';
import { DrawingData, DrawingStroke } from '../types/note';

interface DrawingModalProps {
  isOpen: boolean;
  initialDrawing?: DrawingData;
  onSave: (drawing: DrawingData) => void;
  onClose: () => void;
}

const PALETTE = [
  '#0F172A', // Midnight black
  '#DC2626', // Red
  '#F59E0B', // Amber
  '#FFBF24', // Sesh Yellow
  '#16A34A', // Green
  '#84A98C', // Sage
  '#2563EB', // Blue
  '#93C5FD', // Sky
  '#9333EA', // Purple
  '#FFFFFF', // White
];

export const DrawingModal: React.FC<DrawingModalProps> = ({
  isOpen,
  initialDrawing,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser' | 'line'>('pen');
  const [color, setColor] = useState('#0F172A');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [backgroundType, setBackgroundType] = useState<'blank' | 'grid' | 'ruled' | 'dots'>(
    initialDrawing?.canvasBackground || 'blank'
  );

  const [strokes, setStrokes] = useState<DrawingStroke[]>(initialDrawing?.strokes || []);
  const [undoneStrokes, setUndoneStrokes] = useState<DrawingStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);

  // Initialize canvas resolution & redraw on mount or strokes change
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    redrawCanvas();
  }, [isOpen, strokes, backgroundType]);

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    if (backgroundType === 'grid') {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 0.5;
      const step = 24;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (backgroundType === 'ruled') {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 0.75;
      const step = 28;
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (backgroundType === 'dots') {
      ctx.fillStyle = '#CBD5E1';
      const step = 24;
      for (let x = step / 2; x < width; x += step) {
        for (let y = step / 2; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    drawBackground(ctx, rect.width, rect.height);

    for (const s of strokes) {
      if (s.points.length < 2) continue;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (s.isHighlighter) {
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = s.width * 2.5;
      } else {
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = s.width;
      }

      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        // Smooth curve
        const xc = (s.points[i - 1].x + s.points[i].x) / 2;
        const yc = (s.points[i - 1].y + s.points[i].y) / 2;
        ctx.quadraticCurveTo(s.points[i - 1].x, s.points[i - 1].y, xc, yc);
      }
      ctx.lineTo(
        s.points[s.points.length - 1].x,
        s.points[s.points.length - 1].y
      );
      ctx.stroke();
      ctx.restore();
    }
  };

  // Coordinates helper
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pt = getCanvasCoords(e);
    setIsDrawing(true);
    const newStroke: DrawingStroke = {
      color: tool === 'eraser' ? '#FFFFFF' : color,
      width: tool === 'eraser' ? strokeWidth * 4 : strokeWidth,
      points: [pt],
      isHighlighter: tool === 'highlighter',
    };
    setCurrentStroke(newStroke);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    const updated = {
      ...currentStroke,
      points: [...currentStroke.points, pt],
    };
    setCurrentStroke(updated);

    // Live stroke rendering on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (updated.isHighlighter) {
      ctx.strokeStyle = updated.color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = updated.width * 2.5;
    } else {
      ctx.strokeStyle = updated.color;
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = updated.width;
    }

    const pts = updated.points;
    if (pts.length > 1) {
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    if (currentStroke.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
      setUndoneStrokes([]);
    }
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, -1));
    setUndoneStrokes((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (undoneStrokes.length === 0) return;
    const next = undoneStrokes[undoneStrokes.length - 1];
    setUndoneStrokes((prev) => prev.slice(0, -1));
    setStrokes((prev) => [...prev, next]);
  };

  const handleClear = () => {
    if (strokes.length === 0) return;
    if (window.confirm('Clear the entire canvas?')) {
      setStrokes([]);
      setUndoneStrokes([]);
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `sesh_drawing_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSaveAndDone = () => {
    const canvas = canvasRef.current;
    const previewUrl = canvas ? canvas.toDataURL('image/png') : '';
    const rect = canvas?.getBoundingClientRect();
    const aspectRatio = rect ? rect.width / rect.height : 1.5;

    onSave({
      strokes,
      previewUrl,
      aspectRatio,
      canvasBackground: backgroundType,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header toolbar */}
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded-xl transition ${
                tool === 'pen'
                  ? 'bg-[#FFBF24] text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Pen tool"
            >
              <Pen className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTool('highlighter')}
              className={`p-2 rounded-xl transition ${
                tool === 'highlighter'
                  ? 'bg-[#FFBF24] text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Highlighter / Marker"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-xl transition ${
                tool === 'eraser'
                  ? 'bg-[#FFBF24] text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

            {/* Stroke Width Slider */}
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Size:</span>
              <input
                type="range"
                min="2"
                max="28"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-16 sm:w-24 accent-[#FFBF24]"
                title={`Width: ${strokeWidth}px`}
              />
              <span className="text-[11px] text-slate-500 w-4">{strokeWidth}</span>
            </div>

            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Paper style */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setBackgroundType('blank')}
                className={`p-1.5 rounded-lg text-xs ${
                  backgroundType === 'blank'
                    ? 'bg-slate-200 dark:bg-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Blank paper"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBackgroundType('grid')}
                className={`p-1.5 rounded-lg text-xs ${
                  backgroundType === 'grid'
                    ? 'bg-slate-200 dark:bg-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid paper"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBackgroundType('ruled')}
                className={`p-1.5 rounded-lg text-xs ${
                  backgroundType === 'ruled'
                    ? 'bg-slate-200 dark:bg-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Ruled lines"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBackgroundType('dots')}
                className={`p-1.5 rounded-lg text-xs ${
                  backgroundType === 'dots'
                    ? 'bg-slate-200 dark:bg-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Dot grid"
              >
                <CircleDot className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-2 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={undoneStrokes.length === 0}
              className="p-2 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="p-2 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition"
              title="Clear Canvas"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportPNG}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              title="Export as PNG"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleSaveAndDone}
              className="ml-2 px-4 py-2 bg-[#FFBF24] hover:bg-[#F59E0B] text-slate-900 font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>Done</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Color Palette Bar */}
        <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Colors:</span>
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  if (tool === 'eraser') setTool('pen');
                }}
                className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 ${
                  color === c && tool !== 'eraser'
                    ? 'border-[#FFBF24] scale-110 shadow-xs ring-2 ring-[#FFBF24]/50'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}

            {/* Custom Color Input */}
            <label className="cursor-pointer relative flex items-center" title="Pick custom color">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  if (tool === 'eraser') setTool('pen');
                }}
                className="opacity-0 absolute w-0 h-0"
              />
              <div
                className="w-6 h-6 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-500 font-bold hover:scale-110 transition"
                style={{ backgroundColor: color }}
              >
                +
              </div>
            </label>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden bg-white cursor-crosshair">
          <canvas
            ref={canvasRef}
            className="w-full h-full block touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};
