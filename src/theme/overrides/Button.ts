import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Button(theme: Theme) {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          height: 48,
        },
        ...(theme.palette.mode === 'dark'
          ? {
              outlined: {
                border: `1px solid ${theme.palette.grey[400]}`,
                color: theme.palette.grey[400],
              },
            }
          : {}),

        // contained
        containedInherit: {
          color: theme.palette.grey[800],
          boxShadow: theme.customShadows.z8,
          '&:hover': {
            backgroundColor: theme.palette.grey[400],
          },
        },
        containedPrimary: {
          backgroundImage: theme.palette.gradients.primary,
          '&:hover': {
            opacity: 0.82,
          },
        },
        containedSecondary: {},
        containedInfo: {
          boxShadow: theme.customShadows.info,
          backgroundImage: theme.palette.gradients.info,
          '&:hover': {
            opacity: 0.82,
          },
        },
        containedSuccess: {
          boxShadow: theme.customShadows.success,
        },
        containedWarning: {
          boxShadow: theme.customShadows.warning,
        },
        containedError: {
          boxShadow: theme.customShadows.error,
        },
        // outlined
        outlinedInherit: {
          border: `1px solid ${theme.palette.grey[500_32]}`,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
        textInherit: {
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      },
    },
  };
}
