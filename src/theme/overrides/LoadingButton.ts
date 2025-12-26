import { buttonClasses } from '@mui/material';
import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function LoadingButton(theme: Theme) {
  return {
    MuiLoadingButton: {
      styleOverrides: {
        root: {
          '&.MuiButton-text': {
            '& .MuiLoadingButton-startIconPendingStart': {
              marginLeft: 0,
            },
            '& .MuiLoadingButton-endIconPendingEnd': {
              marginRight: 0,
            },
          },
          [`&.${buttonClasses.disabled}`]: {
            background: theme.palette.grey[300],
          },
        },
        containedPrimary: {
          color: theme.palette.grey[800],
        },
        sizeLarge: {
          height: 48,
        },
      },
    },
  };
}
