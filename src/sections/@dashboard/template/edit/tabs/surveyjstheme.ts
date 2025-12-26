import { Theme, alpha } from '@mui/material';

/**
 * SurveyJS Theme Configuration
 *
 * This theme configuration integrates SurveyJS with Material Design principles
 * by utilizing MUI theme values for consistency across the application.
 *
 * Key improvements:
 * - Uses MUI palette colors for primary, secondary, and status colors
 * - Integrates MUI typography system for consistent font styling
 * - Applies MUI shadows and borders for visual cohesion
 * - Supports both light and dark mode themes
 * - Uses MUI spacing and border radius values
 * - Includes action colors for hover, focus, and disabled states
 */
const surveyJsTheme = (theme: Theme) => ({
  cssVariables: {
    // Primary colors using theme values
    '--sjs-primary-background-500': theme.palette.primary.main,
    '--sjs-secondary-background-500': theme.palette.secondary.main,
    '--sjs-layer-3-background-500': theme.palette.background.neutral,
    '--sjs-special-background': theme.palette.background.neutral,

    // Background colors
    '--sjs-general-backcolor': theme.palette.background.paper,
    '--sjs-general-backcolor-dark': theme.palette.background.default,
    '--sjs-general-backcolor-dim': theme.palette.background.neutral,
    '--sjs-general-backcolor-dim-light': theme.palette.background.neutral,
    '--sjs-general-backcolor-dim-dark': theme.palette.background.neutral,

    // Text colors
    '--sjs-general-forecolor': theme.palette.text.primary,
    '--sjs-general-forecolor-light': theme.palette.text.secondary,
    '--sjs-general-dim-forecolor': theme.palette.text.primary,
    '--sjs-general-dim-forecolor-light': theme.palette.text.secondary,

    // Primary theme colors
    '--sjs-primary-backcolor': theme.palette.primary.main,
    '--sjs-primary-backcolor-light': theme.palette.primary.light,
    '--sjs-primary-backcolor-dark': theme.palette.primary.dark,
    '--sjs-primary-forecolor': theme.palette.primary.contrastText,
    '--sjs-primary-forecolor-light': theme.palette.primary.contrastText,

    // Base units using theme values
    '--sjs-base-unit': `${theme.spacing(1)}`,
    '--sjs-corner-radius': `${theme.shape.borderRadius}px`,

    // Secondary colors using theme values
    '--sjs-secondary-backcolor': theme.palette.secondary.main,
    '--sjs-secondary-backcolor-light': alpha(theme.palette.secondary.main, 0.1),
    '--sjs-secondary-backcolor-semi-light': alpha(theme.palette.secondary.main, 0.25),
    '--sjs-secondary-forecolor': theme.palette.secondary.contrastText,
    '--sjs-secondary-forecolor-light': alpha(theme.palette.secondary.contrastText, 0.25),

    // Action colors for better Material Design integration
    '--sjs-action-hover': theme.palette.action.hover,
    '--sjs-action-selected': theme.palette.action.selected,
    '--sjs-action-disabled': theme.palette.action.disabled,
    '--sjs-action-focus': theme.palette.action.focus,

    // Shadows using theme values
    '--sjs-shadow-small': theme.shadows[1],
    '--sjs-shadow-small-reset': 'none',
    '--sjs-shadow-medium': theme.shadows[2],
    '--sjs-shadow-large': theme.shadows[8],
    '--sjs-shadow-inner': `inset 0 0 0 1px ${theme.palette.divider}`,
    '--sjs-shadow-inner-reset': 'none',

    // Borders using theme values
    '--sjs-border-light': theme.palette.divider,
    '--sjs-border-default': theme.palette.divider,
    '--sjs-border-inside': alpha(theme.palette.divider, 0.6),

    // Status colors using theme values
    '--sjs-special-red': theme.palette.error.main,
    '--sjs-special-red-light': alpha(theme.palette.error.main, 0.1),
    '--sjs-special-red-forecolor': theme.palette.error.contrastText,
    '--sjs-special-green': theme.palette.success.main,
    '--sjs-special-green-light': alpha(theme.palette.success.main, 0.1),
    '--sjs-special-green-forecolor': theme.palette.success.contrastText,
    '--sjs-special-blue': theme.palette.info.main,
    '--sjs-special-blue-light': alpha(theme.palette.info.main, 0.1),
    '--sjs-special-blue-forecolor': theme.palette.info.contrastText,
    '--sjs-special-yellow': theme.palette.warning.main,
    '--sjs-special-yellow-light': alpha(theme.palette.warning.main, 0.1),
    '--sjs-special-yellow-forecolor': theme.palette.warning.contrastText,

    // Typography using theme values
    '--sjs-article-font-xx-large-textDecoration': 'none',
    '--sjs-article-font-xx-large-fontWeight': String(theme.typography.h1.fontWeight || 700),
    '--sjs-article-font-xx-large-fontStyle': 'normal',
    '--sjs-article-font-xx-large-fontStretch': 'normal',
    '--sjs-article-font-xx-large-letterSpacing': String(theme.typography.h1.letterSpacing || '0'),
    '--sjs-article-font-xx-large-lineHeight': String(theme.typography.h1.lineHeight || 1.2),
    '--sjs-article-font-xx-large-paragraphIndent': '0px',
    '--sjs-article-font-xx-large-textCase': 'none',

    '--sjs-article-font-x-large-textDecoration': 'none',
    '--sjs-article-font-x-large-fontWeight': String(theme.typography.h2.fontWeight || 700),
    '--sjs-article-font-x-large-fontStyle': 'normal',
    '--sjs-article-font-x-large-fontStretch': 'normal',
    '--sjs-article-font-x-large-letterSpacing': String(theme.typography.h2.letterSpacing || '0'),
    '--sjs-article-font-x-large-lineHeight': String(theme.typography.h2.lineHeight || 1.2),
    '--sjs-article-font-x-large-paragraphIndent': '0px',
    '--sjs-article-font-x-large-textCase': 'none',

    '--sjs-article-font-large-textDecoration': 'none',
    '--sjs-article-font-large-fontWeight': String(theme.typography.h3.fontWeight || 700),
    '--sjs-article-font-large-fontStyle': 'normal',
    '--sjs-article-font-large-fontStretch': 'normal',
    '--sjs-article-font-large-letterSpacing': String(theme.typography.h3.letterSpacing || '0'),
    '--sjs-article-font-large-lineHeight': String(theme.typography.h3.lineHeight || 1.5),
    '--sjs-article-font-large-paragraphIndent': '0px',
    '--sjs-article-font-large-textCase': 'none',

    '--sjs-article-font-medium-textDecoration': 'none',
    '--sjs-article-font-medium-fontWeight': String(theme.typography.h4.fontWeight || 700),
    '--sjs-article-font-medium-fontStyle': 'normal',
    '--sjs-article-font-medium-fontStretch': 'normal',
    '--sjs-article-font-medium-letterSpacing': String(theme.typography.h4.letterSpacing || '0'),
    '--sjs-article-font-medium-lineHeight': String(theme.typography.h4.lineHeight || 1.5),
    '--sjs-article-font-medium-paragraphIndent': '0px',
    '--sjs-article-font-medium-textCase': 'none',

    '--sjs-article-font-default-textDecoration': 'none',
    '--sjs-article-font-default-fontWeight': String(theme.typography.body1.fontWeight || 400),
    '--sjs-article-font-default-fontStyle': 'normal',
    '--sjs-article-font-default-fontStretch': 'normal',
    '--sjs-article-font-default-letterSpacing': String(theme.typography.body1.letterSpacing || '0'),
    '--sjs-article-font-default-lineHeight': String(theme.typography.body1.lineHeight || 1.5),
    '--sjs-article-font-default-paragraphIndent': '0px',
    '--sjs-article-font-default-textCase': 'none',
  },
  isPanelless: false,
  themeName: 'plain',
  colorPalette: theme.palette.mode === 'light' ? 'light' : 'dark',
});

export default surveyJsTheme;
