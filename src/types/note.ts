/**
 * Sesh@ Core Type Definitions
 */

export type NoteType = 'text' | 'checklist' | 'drawing' | 'mixed';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface DrawingStroke {
  color: string;
  width: number;
  points: { x: number; y: number }[];
  isHighlighter?: boolean;
}

export interface DrawingData {
  strokes: DrawingStroke[];
  previewUrl?: string; // Data URL or Drive file URL
  aspectRatio: number;
  canvasBackground?: 'blank' | 'grid' | 'ruled' | 'dots';
}

export interface NoteImage {
  id: string;
  url: string; // Data URL or Drive WebLink
  driveFileId?: string;
  name: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
}

export interface NoteAppearance {
  // Background
  bgType: 'solid' | 'gradient' | 'image' | 'preset';
  bgColor: string; // e.g. #FFFBF2 or #FEF3C7
  bgGradient?: string; // e.g. linear-gradient(...)
  bgImageUrl?: string;
  bgOverlayOpacity?: number; // 0 to 1
  bgBrightness?: number; // 0.5 to 1.5
  bgBlur?: number; // 0 to 20 px

  // Typography
  fontFamily: 'Inter' | 'Poppins' | 'Caveat' | 'Merriweather' | 'Fira Code';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  textHighlight?: string;

  // Card Styling
  borderRadius: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // 6px, 12px, 16px, 24px
  borderWidth: number; // 0, 1, 2, 3
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'colored';
  padding: 'compact' | 'normal' | 'spacious';
}

export interface AppearancePreset {
  id: string;
  name: string;
  description?: string;
  appearance: NoteAppearance;
  isSystem?: boolean;
  createdAt: number;
}

export interface Collaborator {
  email: string;
  role: 'viewer' | 'editor';
  addedAt: number;
  displayName?: string;
  avatarUrl?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Plain text or markdown
  type: NoteType;
  items: ChecklistItem[];
  drawings: DrawingData[];
  images: NoteImage[];
  labels: string[]; // Label IDs
  isPinned: boolean;
  isStarred?: boolean;
  reminderDate?: number | null;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt?: number | null;
  appearance: NoteAppearance;
  presetId?: string;
  collaborators: Collaborator[];
  driveFileId?: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  syncStatus?: 'synced' | 'saving' | 'offline-pending' | 'error';
  syncError?: string;
  codeSnippet?: { language: string; code: string };
  links?: { title: string; url: string }[];
  quote?: string;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface WorkspaceIndex {
  version: number;
  workspaceName: string;
  lastUpdated: number;
  notesMeta: {
    id: string;
    title: string;
    driveFileId?: string;
    updatedAt: number;
    isPinned: boolean;
    isArchived: boolean;
    isTrashed: boolean;
    labels: string[];
  }[];
  labels: Label[];
  presets: AppearancePreset[];
  workspaceSettings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string; // Hex
  layout: 'masonry' | 'compact' | 'list';
  workspaceWallpaper: 'default' | 'dots' | 'grid' | 'sunset' | 'sage' | 'custom';
  customWallpaperUrl?: string;
  reduceMotion: boolean;
  showChecklistProgress: boolean;
  autoMoveCompletedToBottom: boolean;
}

export type SyncState = 'idle' | 'saving' | 'synced' | 'offline' | 'error';
