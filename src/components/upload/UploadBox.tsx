import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

import Iconify from 'components/Iconify';
import { UploadProps } from './type';
import { IconButton, ListItem, ListItemIcon, ListItemText } from '@mui/material';

// ----------------------------------------------------------------------

export default function UploadBox({
  files,
  placeholder,
  error,
  disabled,
  sx,
  onRemove,
  ...other
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    disabled,
    ...other,
  });

  const hasError = isDragReject || error;

  const renderContent = (
    <ListItem>
      <ListItemIcon>
        <Iconify icon="mdi:file" />
      </ListItemIcon>
      {/* @ts-ignore */}
      <ListItemText primary={files?.name} />
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          /* @ts-ignore */
          onRemove();
        }}
      >
        <Iconify icon="eva:close-fill" width={24} />
      </IconButton>
    </ListItem>
  );

  return (
    <Box
      {...getRootProps()}
      sx={{
        width: 64,
        height: 64,
        flexShrink: 0,
        display: 'flex',
        borderRadius: 1,
        cursor: 'pointer',
        alignItems: 'center',
        color: files ? '' : 'text.disabled',
        justifyContent: 'center',
        bgcolor: (theme) => (files ? '' : alpha(theme.palette.grey[500], 0.08)),
        border: (theme) =>
          files
            ? `solid 1px ${theme.palette.grey[400]}`
            : `dashed 1px ${alpha(theme.palette.grey[500], 0.16)}`,
        ...(isDragActive && {
          opacity: 0.72,
        }),
        ...(disabled && {
          opacity: 0.48,
          pointerEvents: 'none',
        }),
        ...(hasError && {
          color: 'error.main',
          borderColor: 'error.main',
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
        }),
        '&:hover': {
          opacity: 0.72,
        },
        ...sx,
      }}
    >
      <input {...getInputProps()} />

      {!files && (placeholder || <Iconify icon="eva:cloud-upload-fill" width={28} />)}

      {files && renderContent}
    </Box>
  );
}
