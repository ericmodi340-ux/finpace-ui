import { Stack, Typography } from '@mui/material';
import React from 'react';

interface DraggableFieldItemProps {
  type: string;
  icon: any;
  label: string;
  onDragStart: (e: React.DragEvent, type: string) => void;
}

export const DraggableFieldItem: React.FC<DraggableFieldItemProps> = ({
  type,
  icon,
  label,
  onDragStart,
}) => (
  <Stack
    sx={{
      border: (theme) => `1px solid ${theme.palette.divider}`,
      px: 2,
      py: 1,
      cursor: 'move',
      ':hover': {
        backgroundColor: (theme) => theme.palette.action.hover,
      },
    }}
    draggable
    onDragStart={(e) => onDragStart(e, type)}
    direction="row"
    alignItems="center"
    spacing={1}
  >
    {icon}
    <Typography variant="subtitle2">{label}</Typography>
  </Stack>
);
