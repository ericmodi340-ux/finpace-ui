import { ReactNode } from 'react';
import { IconifyIcon } from '@iconify/react';
import { SnackbarProvider } from 'notistack';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import { Box, GlobalStyles } from '@mui/material';
// theme
import { ColorSchema } from '../theme/palette';
// components
import Iconify from 'components/Iconify';
import SnackbarCloseButton from 'components/SnackbarCloseButton';

// ----------------------------------------------------------------------

function SnackbarStyles() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <GlobalStyles
      styles={{
        '#root': {
          '& .SnackbarContent-root': {
            width: '100%',
            padding: theme.spacing(1.5),
            margin: theme.spacing(0.25, 0),
            boxShadow: theme.customShadows.z8,
            borderRadius: theme.shape.borderRadius,
            color: theme.palette.grey[isLight ? 0 : 800],
            backgroundColor: theme.palette.grey[isLight ? 900 : 0],
            '&.SnackbarItem-variantSuccess, &.SnackbarItem-variantError, &.SnackbarItem-variantWarning, &.SnackbarItem-variantInfo':
              {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
              },
          },
          '& .SnackbarItem-message': {
            padding: '0 !important',
            fontWeight: theme.typography.fontWeightMedium,
          },
          '& .SnackbarItem-action': {
            marginRight: 0,
            color: theme.palette.action.active,
            '& svg': { width: 20, height: 20 },
          },
        },
      }}
    />
  );
}

type Props = {
  children: ReactNode;
};

export default function NotistackProvider({ children }: Props) {
  return (
    <>
      <SnackbarStyles />

      <SnackbarProvider
        dense
        maxSnack={5}
        // preventDuplicate
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        iconVariant={{
          success: <SnackbarIcon icon={'eva:checkmark-circle-2-fill'} color="primary" />,
          error: <SnackbarIcon icon={'eva:info-fill'} color="error" />,
          warning: <SnackbarIcon icon={'eva:alert-triangle-fill'} color="warning" />,
          info: <SnackbarIcon icon={'eva:alert-circle-fill'} color="info" />,
        }}
        action={(snackbarKey) => <SnackbarCloseButton snackbarKey={snackbarKey} />}
      >
        {children}
      </SnackbarProvider>
    </>
  );
}

// ----------------------------------------------------------------------

type SnackbarIconProps = {
  icon: IconifyIcon | string;
  color: ColorSchema;
};

export function SnackbarIcon({ icon, color }: SnackbarIconProps) {
  return (
    <Box
      component="span"
      sx={{
        mr: 1.5,
        width: 40,
        height: 40,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        color: `${color}.main`,
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.16),
      }}
    >
      <Iconify icon={icon} width={24} height={24} />
    </Box>
  );
}
