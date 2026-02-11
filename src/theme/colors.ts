export interface AccentTheme {
  name: string;
  accent: string;
  accentL: string;
  accentRgb: string;
}

export interface PrimaryTheme {
  name: string;
  bg: string;
  bgS: string;
  bgE: string;
  bgI: string;
  bgH: string;
  t1: string;
  t2: string;
  t3: string;
  border: string;
  borderA: string;
  divider: string;
  navBg: string;
  navBorder: string;
  isLight: boolean;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export const ACCENT_THEMES: Record<string, AccentTheme> = {
  purple: { name: 'Purple', accent: '#7C5CFC', accentL: '#9B85FF', accentRgb: hexToRgb('#7C5CFC') },
  ocean: { name: 'Blue', accent: '#0EA5E9', accentL: '#38BDF8', accentRgb: hexToRgb('#0EA5E9') },
  forest: { name: 'Green', accent: '#10B981', accentL: '#34D399', accentRgb: hexToRgb('#10B981') },
  sunset: { name: 'Orange', accent: '#F97316', accentL: '#FB923C', accentRgb: hexToRgb('#F97316') },
  blood: { name: 'Red', accent: '#EF4444', accentL: '#F87171', accentRgb: hexToRgb('#EF4444') },
  pink: { name: 'Pink', accent: '#EC4899', accentL: '#F472B6', accentRgb: hexToRgb('#EC4899') },
  cyan: { name: 'Cyan', accent: '#06B6D4', accentL: '#22D3EE', accentRgb: hexToRgb('#06B6D4') },
  yellow: { name: 'Yellow', accent: '#EAB308', accentL: '#FACC15', accentRgb: hexToRgb('#EAB308') },
  lime: { name: 'Lime', accent: '#84CC16', accentL: '#A3E635', accentRgb: hexToRgb('#84CC16') },
  indigo: { name: 'Indigo', accent: '#6366F1', accentL: '#818CF8', accentRgb: hexToRgb('#6366F1') },
  slate: { name: 'Slate', accent: '#64748B', accentL: '#94A3B8', accentRgb: hexToRgb('#64748B') },
};

export const PRIMARY_THEMES: Record<string, PrimaryTheme> = {
  dark: {
    name: 'Dark',
    bg: '#08080C', bgS: '#111118', bgE: '#1A1A24', bgI: '#14141E', bgH: '#1E1E2A',
    t1: '#F1F1F6', t2: '#8B8BA0', t3: '#55556A',
    border: 'rgba(255,255,255,0.06)', borderA: 'rgba(255,255,255,0.12)', divider: 'rgba(255,255,255,0.04)',
    navBg: 'rgba(8,8,12,0.95)', navBorder: 'rgba(255,255,255,0.06)',
    isLight: false,
  },
  light: {
    name: 'Light',
    bg: '#FAFAFA', bgS: '#FFFFFF', bgE: '#F0F0F5', bgI: '#F5F5FA', bgH: '#E8E8F0',
    t1: '#1A1A2E', t2: '#6B6B80', t3: '#9B9BB0',
    border: 'rgba(0,0,0,0.08)', borderA: 'rgba(0,0,0,0.14)', divider: 'rgba(0,0,0,0.05)',
    navBg: 'rgba(250,250,250,0.95)', navBorder: 'rgba(0,0,0,0.08)',
    isLight: true,
  },
  neutral: {
    name: 'Neutral',
    bg: '#F5F0EB', bgS: '#FAF7F4', bgE: '#EDE8E3', bgI: '#F0ECE7', bgH: '#E5E0DB',
    t1: '#2C2825', t2: '#7A756F', t3: '#A8A29E',
    border: 'rgba(0,0,0,0.06)', borderA: 'rgba(0,0,0,0.12)', divider: 'rgba(0,0,0,0.04)',
    navBg: 'rgba(245,240,235,0.95)', navBorder: 'rgba(0,0,0,0.06)',
    isLight: true,
  },
  grey: {
    name: 'Grey',
    bg: '#2A2A2E', bgS: '#35353A', bgE: '#3E3E44', bgI: '#303036', bgH: '#44444A',
    t1: '#E8E8EC', t2: '#9E9EA8', t3: '#6E6E7A',
    border: 'rgba(255,255,255,0.08)', borderA: 'rgba(255,255,255,0.14)', divider: 'rgba(255,255,255,0.05)',
    navBg: 'rgba(42,42,46,0.95)', navBorder: 'rgba(255,255,255,0.08)',
    isLight: false,
  },
};

export const SEMANTIC_COLORS = {
  ok: '#10B981',
  okGlow: 'rgba(16,185,129,0.20)',
  err: '#EF4444',
  errGlow: 'rgba(239,68,68,0.20)',
  warn: '#F59E0B',
  water: '#3B82F6',
  waterL: '#60A5FA',
};

export const TYPE_COLORS: Record<string, string> = {
  checkbox: '#10B981',
  counter: '#7C5CFC',
  value: '#F59E0B',
  water: '#3B82F6',
  multi: '#F97316',
  timer: '#06B6D4',
  photo: '#EC4899',
  journal: '#8B5CF6',
};

export const TASK_ICONS: Record<string, string> = {
  checkbox: '✅',
  counter: '🔢',
  value: '📊',
  water: '💧',
  multi: '☑️',
  timer: '⏱️',
  photo: '📸',
  journal: '📝',
};
