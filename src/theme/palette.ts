import { alpha } from '@mui/material/styles';
import { WHITE_LABEL_ASSETS_PATHS } from 'utils/whiteLable';

// ----------------------------------------------------------------------

function createGradient(color1: string, color2: string) {
  return `linear-gradient(to right, ${color1}, ${color2})`;
}

export type ColorSchema =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'orange';

interface GradientsPaletteOptions {
  primary: string;
  info: string;
  success: string;
  warning: string;
  error: string;
}

interface ChartPaletteOptions {
  violet: string[];
  blue: string[];
  green: string[];
  yellow: string[];
  red: string[];
}

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    neutral: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
  interface Palette {
    gradients: GradientsPaletteOptions;
    chart: ChartPaletteOptions;
    orange: Palette['primary'];
  }
  interface PaletteOptions {
    gradients: GradientsPaletteOptions;
    chart: ChartPaletteOptions;
    orange: PaletteOptions['primary'];
  }
}

declare module '@mui/material' {
  interface Color {
    0: string;
    500_8: string;
    500_12: string;
    500_16: string;
    500_24: string;
    500_32: string;
    500_48: string;
    500_56: string;
    500_80: string;
  }
}

// SETUP COLORS
export const PRIMARY = WHITE_LABEL_ASSETS_PATHS[window.location.host]?.primaryPalette || {
  lighter: '#D0F7EE',
  light: '#6ED1C9',
  main: '#166168',
  dark: '#0B3A4A',
  darker: '#041F31',
};

export const SECONDARY = WHITE_LABEL_ASSETS_PATHS[window.location.host]?.secondaryPalette || {
  lighter: '#FECED6',
  light: '#FD6EA0',
  main: '#F90F90',
  dark: '#B30788',
  darker: '#770271',
};

export const INFO = {
  lighter: '#C9F0FA',
  light: '#5CB9E1',
  main: '#035D9E',
  dark: '#013571',
  darker: '#001B4B',
};
export const INFO_DARK = {
  lighter: '#96B0B4',
  light: '#7C9599',
  main: '#B1CBCF',
  dark: '#3E565A',
  darker: '#273F43',
};
export const SUCCESS = {
  lighter: '#D1F8CC',
  light: '#64D86F',
  main: '#0E7F2E',
  dark: '#075B2F',
  darker: '#023C29',
};
export const WARNING = {
  lighter: '#FEF4CD',
  light: '#FDD269',
  main: '#F9A107',
  dark: '#B36603',
  darker: '#773A01',
};
export const ERROR = {
  lighter: '#FDD7D0',
  light: '#F57379',
  main: '#E01A49',
  dark: '#A10D4C',
  darker: '#6B0444',
};
const ORANGE = {
  lighter: '#FFEDD5',
  light: '#FFA95C',
  main: '#FF7300',
  dark: '#C54C00',
  darker: '#8F3900',
};

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
  500_8: alpha('#919EAB', 0.08),
  500_12: alpha('#919EAB', 0.12),
  500_16: alpha('#919EAB', 0.16),
  500_24: alpha('#919EAB', 0.24),
  500_32: alpha('#919EAB', 0.32),
  500_48: alpha('#919EAB', 0.48),
  500_56: alpha('#919EAB', 0.56),
  500_80: alpha('#919EAB', 0.8),
};

const GRADIENTS = {
  primary: createGradient(PRIMARY.main, PRIMARY.dark),
  info: createGradient(PRIMARY.main, '#86A5A8'),
  success: createGradient(SUCCESS.light, SUCCESS.main),
  warning: createGradient(WARNING.light, WARNING.main),
  error: createGradient(ERROR.light, ERROR.main),
};

const CHART_COLORS = {
  violet: ['#826AF9', '#9E86FF', '#D0AEFF', '#F7D2FF'],
  blue: ['#2D99FF', '#83CFFF', '#A5F3FF', '#CCFAFF'],
  green: ['#2CD9C5', '#60F1C8', '#A4F7CC', '#C0F2DC'],
  yellow: ['#FFE700', '#FFEF5A', '#FFF7AE', '#FFF3D6'],
  red: ['#FF6C40', '#FF8F6D', '#FFBD98', '#FFF2D4'],
};

const COMMON = {
  common: { black: '#000', white: '#fff' },
  primary: { ...PRIMARY, contrastText: '#fff' },
  secondary: { ...SECONDARY, contrastText: '#fff' },
  info: { ...INFO, contrastText: '#fff' },
  success: { ...SUCCESS, contrastText: GREY[800] },
  warning: { ...WARNING, contrastText: GREY[800] },
  error: { ...ERROR, contrastText: '#fff' },
  orange: { ...ORANGE, contrastText: '#fff' },
  grey: GREY,
  gradients: GRADIENTS,
  chart: CHART_COLORS,
  divider: GREY[500_24],
  action: {
    hover: GREY[500_8],
    selected: GREY[500_16],
    disabled: GREY[500_80],
    disabledBackground: GREY[500_24],
    focus: GREY[500_24],
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

const palette = {
  light: {
    ...COMMON,
    mode: 'light',
    text: { primary: GREY[800], secondary: GREY[600], disabled: GREY[500] },
    background: {
      paper: WHITE_LABEL_ASSETS_PATHS[window.location.host]?.background?.paper || '#fff',
      default: WHITE_LABEL_ASSETS_PATHS[window.location.host]?.background?.paper || '#fff',
      neutral: '#fafafa',
    },
    action: { active: GREY[600], ...COMMON.action },
  },
  dark: {
    ...COMMON,
    mode: 'dark',
    gradients: {},
    info: { ...INFO_DARK, contrastText: '#000' },
    text: { primary: '#fff', secondary: GREY[300], disabled: GREY[600] },
    background: { paper: '#171f22', default: '#0e1719', neutral: '#0e1719' },
    action: { active: GREY[300], ...COMMON.action },
  },
} as const;

export default palette;
