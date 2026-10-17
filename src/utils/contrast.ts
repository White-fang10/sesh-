import { NoteAppearance } from '../types/note';

/**
 * Calculates the relative perceived luminance of a hex or rgb color string.
 * Uses the ITU-R BT.601 formula: Y = 0.299*R + 0.587*G + 0.114*B
 */
export function getLuminance(colorStr: string): number {
  if (!colorStr) return 255;

  let r = 255;
  let g = 255;
  let b = 255;

  const hexMatch = colorStr.trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    r = parseInt(hexMatch[1], 16);
    g = parseInt(hexMatch[2], 16);
    b = parseInt(hexMatch[3], 16);
  } else {
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      r = parseInt(rgbMatch[1], 10);
      g = parseInt(rgbMatch[2], 10);
      b = parseInt(rgbMatch[3], 10);
    } else {
      // Shorthand hex #RGB
      const shortHex = colorStr.trim().match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
      if (shortHex) {
        r = parseInt(shortHex[1] + shortHex[1], 16);
        g = parseInt(shortHex[2] + shortHex[2], 16);
        b = parseInt(shortHex[3] + shortHex[3], 16);
      }
    }
  }

  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Detects if a background (solid, gradient, or image) is perceived as dark
 */
export function isDarkBackground(appearance: NoteAppearance): boolean {
  if (appearance.bgType === 'image') {
    // If background image is set, usually dark overlay provides contrast for white text,
    // or if overlay opacity is low, default to dark mode text (white)
    const overlay = appearance.bgOverlayOpacity ?? 0.8;
    return overlay < 0.6; // less than 60% white overlay means dark image shines through
  }

  if (appearance.bgType === 'gradient' && appearance.bgGradient) {
    // Check all hex stops and compute average luminance
    const hexes = appearance.bgGradient.match(/#[a-f\d]{6}/gi);
    if (hexes && hexes.length > 0) {
      const avgLum = hexes.reduce((acc, h) => acc + getLuminance(h), 0) / hexes.length;
      return avgLum < 140;
    }
  }

  const lum = getLuminance(appearance.bgColor || '#FFFFFF');
  return lum < 140;
}

/**
 * Automatically detects whether the background is dark or light,
 * and returns the opposite high-contrast text color so text is 100% readable.
 */
export function getContrastingTextColor(
  bgColorOrGradient: string,
  defaultLight = '#0F172A',
  defaultDark = '#F8FAFC'
): string {
  if (bgColorOrGradient.includes('gradient')) {
    const hexes = bgColorOrGradient.match(/#[a-f\d]{6}/gi);
    if (hexes && hexes.length > 0) {
      const avgLum = hexes.reduce((acc, h) => acc + getLuminance(h), 0) / hexes.length;
      return avgLum < 140 ? defaultDark : defaultLight;
    }
  }

  const luminance = getLuminance(bgColorOrGradient);
  return luminance < 140 ? defaultDark : defaultLight;
}

/**
 * Automatically computes a subtle harmonious border color for the background
 */
export function getContrastingBorderColor(bgColor: string): string {
  const luminance = getLuminance(bgColor);
  if (luminance < 140) {
    // Dark background -> translucent white border
    return 'rgba(255, 255, 255, 0.15)';
  } else {
    // Light background -> subtle dark border
    return 'rgba(15, 23, 42, 0.08)';
  }
}

/**
 * Returns comprehensive color tokens for a note card based on its background
 */
export function getCardColorTokens(appearance: NoteAppearance) {
  const isDark = isDarkBackground(appearance);

  return {
    isDark,
    titleColor: isDark ? '#FFFFFF' : '#0F172A',
    bodyColor: isDark ? '#F1F5F9' : '#1E293B',
    secondaryColor: isDark ? '#94A3B8' : '#475569',
    mutedColor: isDark ? '#64748B' : '#94A3B8',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)',
    buttonHoverBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  };
}

export const LIGHT_TO_DARK_BG_MAP: Record<string, string> = {
  // Whites / Light default surfaces
  '#FFFFFF': '#151C28',
  '#FFFBF2': '#151C28',
  '#F8FAFC': '#151C28',
  '#F9FAFB': '#151C28',
  '#F3F4F6': '#19202E',
  '#E2E8F0': '#1A2332',

  // Yellow / Amber (Hackathon Ideas)
  '#FEF3C7': '#231C10',
  '#FFF8E7': '#231C10',
  '#FDE68A': '#2E2413',
  '#FFEDD5': '#261A13',
  '#FED7AA': '#332115',

  // Peach / Pink / Red (Grocery List, Birthday Gift Ideas)
  '#FFEBEA': '#261518',
  '#FEE2E2': '#261518',
  '#FFF1F2': '#231417',
  '#FFE4E6': '#231417',
  '#FECDD3': '#341B20',

  // Mint / Sage / Green (Today's Tasks)
  '#EDFDF5': '#0D2018',
  '#DCFCE7': '#0D2018',
  '#ECFDF5': '#0D2018',
  '#D1FAE5': '#122B20',
  '#A7F3D0': '#163828',

  // Blue / Sky (Important Links, Semester Fees)
  '#EFF6FF': '#0E1B2E',
  '#E0F2FE': '#0F1E30',
  '#DBEAFE': '#0E1B2E',
  '#BAE6FD': '#122338',
  '#BFDBFE': '#13243C',
  '#F0F9FF': '#0F1E30',
  '#E0E7FF': '#14182E',

  // Lavender / Purple (Book Recommendations)
  '#F5F3FF': '#1C132B',
  '#EDE9FE': '#1C132B',
  '#F3E8FF': '#1C132B',
  '#DDD6FE': '#26193D',
  '#E9D5FF': '#2A1842',

  // Slate
  '#334155': '#0F172A',
  '#0F172A': '#090D14',
};

export const DARK_TO_LIGHT_BG_MAP: Record<string, string> = {
  // Whites / Slates
  '#151C28': '#FFFFFF',
  '#131B27': '#FFFFFF',
  '#141B26': '#FFFFFF',
  '#181F2A': '#FFFFFF',
  '#131922': '#FFFFFF',
  '#19202E': '#F3F4F6',
  '#1A2332': '#E2E8F0',

  // Yellows
  '#231C10': '#FEF3C7',
  '#241E13': '#FEF3C7',
  '#282114': '#FEF3C7',
  '#2E2413': '#FEF3C7',
  '#261A13': '#FFEDD5',

  // Peaches
  '#261518': '#FFEBEA',
  '#2A171A': '#FFEBEA',
  '#28181B': '#FFF1F2',
  '#231417': '#FFF1F2',
  '#28151A': '#FFE4E6',

  // Greens
  '#0D2018': '#EDFDF5',
  '#12261E': '#EDFDF5',
  '#12241D': '#EDFDF5',

  // Blues
  '#0E1B2E': '#EFF6FF',
  '#0F1E30': '#EFF6FF',
  '#122036': '#EFF6FF',
  '#122338': '#E0F2FE',
  '#142236': '#EFF6FF',
  '#122533': '#F0F9FF',
  '#14182E': '#E0E7FF',

  // Lavenders
  '#1C132B': '#F5F3FF',
  '#211832': '#F5F3FF',
  '#1D142D': '#F5F3FF',

  // Deep
  '#0D1117': '#FFFFFF',
  '#0F172A': '#FFFFFF',
  '#080D14': '#0F172A',
};

export const LIGHT_BORDER_MAP: Record<string, string> = {
  '#FEF3C7': '#FDE68A',
  '#FFEDD5': '#FED7AA',
  '#FFEBEA': '#FECDD3',
  '#FEE2E2': '#FECDD3',
  '#FFF1F2': '#FECDD3',
  '#FFE4E6': '#FECDD3',
  '#EDFDF5': '#A7F3D0',
  '#DCFCE7': '#A7F3D0',
  '#ECFDF5': '#A7F3D0',
  '#EFF6FF': '#BFDBFE',
  '#E0F2FE': '#BAE6FD',
  '#F0F9FF': '#BAE6FD',
  '#F5F3FF': '#DDD6FE',
  '#EDE9FE': '#DDD6FE',
  '#FFFFFF': 'rgba(15, 23, 42, 0.08)',
};

export const DARK_BORDER_MAP: Record<string, string> = {
  '#231C10': '#382B14',
  '#241E13': '#3A301E',
  '#261518': '#3D1B22',
  '#28181B': '#3F1F27',
  '#231417': '#3D1B22',
  '#0D2018': '#1E3B2F',
  '#12261E': '#1E3B2F',
  '#0E1B2E': '#182C4A',
  '#0F1E30': '#182C4A',
  '#1C132B': '#331E54',
  '#211832': '#331E54',
  '#151C28': 'rgba(255, 255, 255, 0.1)',
  '#131B27': 'rgba(255, 255, 255, 0.1)',
  '#141B26': 'rgba(255, 255, 255, 0.1)',
};

/**
 * Returns exact adaptive colors for light vs dark mode according to the reference designs.
 * For notes with intrinsically dark backgrounds (like #0F172A), always renders dark regardless of app theme.
 */
export function getAdaptiveCardStyles(appearance: NoteAppearance, isDarkMode: boolean) {
  if (appearance.bgType === 'solid') {
    const raw = (appearance.bgColor || '#FFFFFF').toUpperCase();

    // Intrinsically dark card — never re-map, always show dark text/tokens
    const alwaysDark = getLuminance(raw) < 70;
    if (alwaysDark) {
      const borderColor = DARK_BORDER_MAP[raw] || '#1E293B';
      return {
        bgColor: raw,
        borderColor,
        titleColor: '#FFFFFF',
        bodyColor: '#F1F5F9',
        secondaryColor: '#94A3B8',
        mutedColor: '#64748B',
        isDark: true,
      };
    }

    if (isDarkMode) {
      const darkBg = LIGHT_TO_DARK_BG_MAP[raw] || (getLuminance(raw) > 130 ? '#151C28' : raw);
      const borderColor = DARK_BORDER_MAP[darkBg] || 'rgba(255, 255, 255, 0.1)';
      return {
        bgColor: darkBg,
        borderColor,
        titleColor: '#FFFFFF',
        bodyColor: '#F8FAFC',
        secondaryColor: '#94A3B8',
        mutedColor: '#64748B',
        isDark: true,
      };
    } else {
      const lightBg = DARK_TO_LIGHT_BG_MAP[raw] || (getLuminance(raw) < 130 ? '#FFFFFF' : raw);
      const borderColor = LIGHT_BORDER_MAP[lightBg] || 'rgba(15, 23, 42, 0.08)';
      return {
        bgColor: lightBg,
        borderColor,
        titleColor: '#0F172A',
        bodyColor: '#0F172A',
        secondaryColor: '#475569',
        mutedColor: '#94A3B8',
        isDark: false,
      };
    }
  }

  // Gradients and image overlays
  const isDark = isDarkMode || isDarkBackground(appearance);
  return {
    bgColor: appearance.bgColor || (isDarkMode ? '#151C28' : '#FFFFFF'),
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)',
    titleColor: isDark ? '#FFFFFF' : '#0F172A',
    bodyColor: isDark ? '#F8FAFC' : '#0F172A',
    secondaryColor: isDark ? '#94A3B8' : '#475569',
    mutedColor: isDark ? '#64748B' : '#94A3B8',
    isDark,
  };
}

/**
 * Adjusts NoteAppearance so text and borders automatically match background contrast
 */
export function autoAdjustNoteAppearance(app: NoteAppearance): NoteAppearance {
  if (app.bgType === 'image') {
    const isDark = (app.bgOverlayOpacity ?? 0.8) < 0.6;
    return {
      ...app,
      textColor: isDark ? '#FFFFFF' : '#0F172A',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    };
  }

  const checkColor = app.bgType === 'gradient' && app.bgGradient ? app.bgGradient : (app.bgColor || '#FFFFFF');
  const textColor = getContrastingTextColor(checkColor);
  const borderColor = getContrastingBorderColor(checkColor);

  return {
    ...app,
    textColor,
    borderColor: app.borderColor || borderColor,
  };
}
