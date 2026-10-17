import { AppearancePreset, NoteAppearance, WorkspaceSettings } from '../types/note';

export const SESH_COLORS = {
  yellow: '#FFBF24',
  amber: '#F59E0B',
  sage: '#84A98C',
  sky: '#93C5FD',
  peach: '#FCA5A5',
  midnight: '#0F172A',
  ivory: '#FFFBF2',
};

export const DEFAULT_NOTE_APPEARANCE: NoteAppearance = {
  bgType: 'solid',
  bgColor: '#FFFFFF',
  fontFamily: 'Inter',
  fontSize: 'base',
  textColor: '#0F172A',
  textAlign: 'left',
  borderRadius: 'lg',
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderStyle: 'solid',
  shadow: 'sm',
  padding: 'normal',
};

export const SYSTEM_PRESETS: AppearancePreset[] = [
  {
    id: 'preset-sesh-yellow',
    name: 'Sesh Classic',
    description: 'Iconic energetic yellow with crisp Midnight text',
    isSystem: true,
    createdAt: 1700000000000,
    appearance: {
      bgType: 'solid',
      bgColor: '#FEF3C7', // soft yellow
      fontFamily: 'Poppins',
      fontSize: 'base',
      textColor: '#0F172A',
      textAlign: 'left',
      borderRadius: 'xl',
      borderWidth: 1,
      borderColor: '#FDE68A',
      borderStyle: 'solid',
      shadow: 'md',
      padding: 'normal',
    },
  },
  {
    id: 'preset-sage-calm',
    name: 'Sage Serenity',
    description: 'Calming botanical green with earthy accents',
    isSystem: true,
    createdAt: 1700000000001,
    appearance: {
      bgType: 'solid',
      bgColor: '#E6EFE9', // subtle sage tint
      fontFamily: 'Inter',
      fontSize: 'base',
      textColor: '#1E293B',
      textAlign: 'left',
      borderRadius: 'xl',
      borderWidth: 1,
      borderColor: '#CBD5E1',
      borderStyle: 'solid',
      shadow: 'sm',
      padding: 'normal',
    },
  },
  {
    id: 'preset-sky-clarity',
    name: 'Sky Breeze',
    description: 'Fresh light blue for quick brainstorms and ideas',
    isSystem: true,
    createdAt: 1700000000002,
    appearance: {
      bgType: 'solid',
      bgColor: '#EFF6FF',
      fontFamily: 'Inter',
      fontSize: 'base',
      textColor: '#1E293B',
      textAlign: 'left',
      borderRadius: 'lg',
      borderWidth: 1,
      borderColor: '#BFDBFE',
      borderStyle: 'solid',
      shadow: 'sm',
      padding: 'normal',
    },
  },
  {
    id: 'preset-peach-glow',
    name: 'Peach Glow',
    description: 'Warm, inviting peach for reminders and priority tasks',
    isSystem: true,
    createdAt: 1700000000003,
    appearance: {
      bgType: 'solid',
      bgColor: '#FFF1F2',
      fontFamily: 'Poppins',
      fontSize: 'base',
      textColor: '#1E293B',
      textAlign: 'left',
      borderRadius: 'xl',
      borderWidth: 1,
      borderColor: '#FECDD3',
      borderStyle: 'solid',
      shadow: 'sm',
      padding: 'normal',
    },
  },
  {
    id: 'preset-midnight-focus',
    name: 'Midnight Studio',
    description: 'Deep contrast dark theme for focused late night work',
    isSystem: true,
    createdAt: 1700000000004,
    appearance: {
      bgType: 'solid',
      bgColor: '#0F172A',
      fontFamily: 'Inter',
      fontSize: 'base',
      textColor: '#F8FAFC',
      textAlign: 'left',
      borderRadius: 'xl',
      borderWidth: 1,
      borderColor: '#334155',
      borderStyle: 'solid',
      shadow: 'lg',
      padding: 'spacious',
    },
  },
  {
    id: 'preset-sunset-gradient',
    name: 'Amber Sunrise',
    description: 'Vibrant amber to peach gradient',
    isSystem: true,
    createdAt: 1700000000005,
    appearance: {
      bgType: 'gradient',
      bgColor: '#FEF3C7',
      bgGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 50%, #FECDD3 100%)',
      fontFamily: 'Poppins',
      fontSize: 'base',
      textColor: '#1E293B',
      textAlign: 'left',
      borderRadius: '2xl',
      borderWidth: 1,
      borderColor: '#FDBA74',
      borderStyle: 'solid',
      shadow: 'colored',
      padding: 'normal',
    },
  },
  {
    id: 'preset-handwritten',
    name: 'Handwritten Journal',
    description: 'Charming handwritten style for personal journals and doodles',
    isSystem: true,
    createdAt: 1700000000006,
    appearance: {
      bgType: 'solid',
      bgColor: '#FEFCE8',
      fontFamily: 'Caveat',
      fontSize: 'lg',
      textColor: '#1E293B',
      textAlign: 'left',
      borderRadius: 'md',
      borderWidth: 1,
      borderColor: '#FEF08A',
      borderStyle: 'dashed',
      shadow: 'sm',
      padding: 'spacious',
    },
  },
  {
    id: 'preset-code-terminal',
    name: 'Hacker Monospace',
    description: 'Clean monospace terminal aesthetic',
    isSystem: true,
    createdAt: 1700000000007,
    appearance: {
      bgType: 'solid',
      bgColor: '#18181B',
      fontFamily: 'Fira Code',
      fontSize: 'sm',
      textColor: '#4ADE80', // terminal green
      textAlign: 'left',
      borderRadius: 'md',
      borderWidth: 1,
      borderColor: '#27272A',
      borderStyle: 'solid',
      shadow: 'md',
      padding: 'normal',
    },
  },
];

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  theme: 'light',
  accentColor: '#FFBF24',
  layout: 'masonry',
  workspaceWallpaper: 'default',
  reduceMotion: false,
  showChecklistProgress: true,
  autoMoveCompletedToBottom: true,
};

export const SOLID_PALETTE = [
  { name: 'Default White', color: '#FFFFFF' },
  { name: 'Sesh Yellow', color: '#FEF3C7' },
  { name: 'Warm Amber', color: '#FFEDD5' },
  { name: 'Sage Green', color: '#E2E8F0' },
  { name: 'Botanical', color: '#DCFCE7' },
  { name: 'Sky Blue', color: '#E0F2FE' },
  { name: 'Soft Indigo', color: '#E0E7FF' },
  { name: 'Lavender', color: '#F3E8FF' },
  { name: 'Peach Pink', color: '#FFE4E6' },
  { name: 'Warm Gray', color: '#F3F4F6' },
  { name: 'Slate Gray', color: '#334155' },
  { name: 'Midnight', color: '#0F172A' },
];

export const GRADIENT_PALETTE = [
  { name: 'Sunburst', gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)' },
  { name: 'Morning Sky', gradient: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)' },
  { name: 'Sage Mist', gradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' },
  { name: 'Berry Sorbet', gradient: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)' },
  { name: 'Lavender Dawn', gradient: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)' },
  { name: 'Golden Hour', gradient: 'linear-gradient(135deg, #FFEDD5 0%, #FDE68A 100%)' },
  { name: 'Deep Space', gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' },
  { name: 'Cyber Neon', gradient: 'linear-gradient(135deg, #18181B 0%, #064E3B 100%)' },
];

export const DEFAULT_REFERENCE_LABELS = [
  { id: 'lbl-personal', name: 'Personal', color: '#F87171', createdAt: 1700000000000 },
  { id: 'lbl-college', name: 'College', color: '#60A5FA', createdAt: 1700000000001 },
  { id: 'lbl-projects', name: 'Projects', color: '#34D399', createdAt: 1700000000002 },
  { id: 'lbl-ideas', name: 'Ideas', color: '#FBBF24', createdAt: 1700000000003 },
  { id: 'lbl-reading', name: 'Reading', color: '#C084FC', createdAt: 1700000000004 },
  { id: 'lbl-finance', name: 'Finance', color: '#2DD4BF', createdAt: 1700000000005 },
];

export const RANDOM_PASTEL_PALETTES: { light: string; dark: string; borderLight: string; borderDark: string; textLight: string; textDark: string }[] = [
  {
    light: '#FEF3C7', // Warm yellow (Hackathon Ideas)
    dark: '#241E13',
    borderLight: '#FDE68A',
    borderDark: '#3A301E',
    textLight: '#0F172A',
    textDark: '#FDE68A',
  },
  {
    light: '#FFE4E6', // Coral / Blush (Grocery List)
    dark: '#28151A',
    borderLight: '#FECDD3',
    borderDark: '#3F1F27',
    textLight: '#0F172A',
    textDark: '#FECDD3',
  },
  {
    light: '#ECFDF5', // Mint / Sage Green (Today's Tasks)
    dark: '#12241D',
    borderLight: '#A7F3D0',
    borderDark: '#1E3B2F',
    textLight: '#0F172A',
    textDark: '#A7F3D0',
  },
  {
    light: '#EFF6FF', // Soft Sky Blue (Important Links)
    dark: '#142236',
    borderLight: '#BFDBFE',
    borderDark: '#1F3452',
    textLight: '#0F172A',
    textDark: '#BFDBFE',
  },
  {
    light: '#F5F3FF', // Soft Lavender (Book Recommendations)
    dark: '#1D142D',
    borderLight: '#DDD6FE',
    borderDark: '#2E1E46',
    textLight: '#0F172A',
    textDark: '#DDD6FE',
  },
  {
    light: '#FFF7ED', // Soft Peach / Warm Cream (Birthday Gift Ideas)
    dark: '#261A13',
    borderLight: '#FED7AA',
    borderDark: '#3C281D',
    textLight: '#0F172A',
    textDark: '#FED7AA',
  },
  {
    light: '#F0F9FF', // Ice Blue (Semester Fees)
    dark: '#122533',
    borderLight: '#BAE6FD',
    borderDark: '#1C384D',
    textLight: '#0F172A',
    textDark: '#BAE6FD',
  },
];

export const getRandomNoteAppearance = (isDark = false): NoteAppearance => {
  const randomIndex = Math.floor(Math.random() * RANDOM_PASTEL_PALETTES.length);
  const palette = RANDOM_PASTEL_PALETTES[randomIndex];

  return {
    bgType: 'solid',
    bgColor: isDark ? palette.dark : palette.light,
    fontFamily: 'Inter',
    fontSize: 'base',
    textColor: isDark ? '#F8FAFC' : palette.textLight,
    textAlign: 'left',
    borderRadius: 'xl',
    borderWidth: 1,
    borderColor: isDark ? palette.borderDark : palette.borderLight,
    borderStyle: 'solid',
    shadow: 'sm',
    padding: 'normal',
  };
};

