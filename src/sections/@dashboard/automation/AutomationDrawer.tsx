import { IconButton, Stack, useTheme } from '@mui/material';
import Iconify from 'components/Iconify';
import React, { useCallback } from 'react';

export const defaultDrawerWidth = 400;
const minDrawerWidth = 340;
const maxDrawerWidth = 800;

type Props = {
  children: React.ReactNode;
};

export default function AutomationDrawer({ children }: Props) {
  const theme = useTheme();
  const [drawerWidth, setDrawerWidth] = React.useState(defaultDrawerWidth);

  const handleMouseDown = (e: any) => {
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mouseup', handleMouseUp, true);
    document.removeEventListener('mousemove', handleMouseMove, true);
  };

  const handleMouseMove = useCallback((e: any) => {
    const newWidth = e.clientX - document.body.offsetLeft;
    if (newWidth > minDrawerWidth && newWidth < maxDrawerWidth) {
      setDrawerWidth(newWidth);
    }
  }, []);

  return (
    <Stack
      sx={{
        width: { xs: '100%', md: drawerWidth },
        position: 'relative',
        flexShrink: 0,
        borderRight: 1,
        borderColor: theme.palette.divider,
      }}
    >
      <IconButton
        sx={{
          position: 'absolute',
          top: 50,
          right: -15,
          background: theme.palette.background.paper,
          border: 1,
          borderColor: theme.palette.divider,
          cursor: 'ew-resize',
          zIndex: 100,
        }}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        <Iconify
          sx={{
            height: 15,
            width: 15,
          }}
          icon={'f7:resize-h'}
        />
      </IconButton>
      <Stack>{children}</Stack>
    </Stack>
  );
}
