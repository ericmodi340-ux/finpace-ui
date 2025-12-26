import { isString } from 'lodash';
import { ReactNode } from 'react';
import { useSnackbar } from 'notistack';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
// @mui
import { Box, Typography, Paper, IconButton, SxProps } from '@mui/material';
import { alpha, Theme, styled } from '@mui/material/styles';
// utils
import { fData } from '../../utils/formatNumber';
//
import Image from '../Image';
import Iconify from '../Iconify';
import { isValidFile } from '../../utils/files';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  width: 144,
  height: 144,
  margin: 'auto',
  borderRadius: '50%',
  padding: theme.spacing(1),
  border: `1px dashed ${theme.palette.grey[500_32]}`,
}));

const DropZoneStyle = styled('div')({
  zIndex: 0,
  width: '100%',
  height: '100%',
  outline: 'none',
  display: 'flex',
  overflow: 'hidden',
  borderRadius: '50%',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  '& > *': { width: '100%', height: '100%' },
  '&:hover': {
    cursor: 'pointer',
    '& .placeholder': {
      zIndex: 9,
    },
  },
});

const PlaceholderStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.neutral,
  transition: theme.transitions.create('opacity', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': { opacity: 0.72 },
}));

// ----------------------------------------------------------------------

interface CustomFile extends File {
  path?: string;
  preview?: string;
}

interface Props extends DropzoneOptions {
  hasTitle?: boolean;
  error?: boolean;
  file: CustomFile | string | null;
  onDelete?: (() => void) | null;
  caption?: ReactNode;
  sx?: SxProps<Theme>;
  placeholder?: ReactNode;
}

export default function UploadAvatar({
  hasTitle,
  error,
  file,
  onDelete,
  caption,
  placeholder,
  sx,
  ...other
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const isValidFileWrapper = (file: any) => isValidFile(file, enqueueSnackbar);

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    validator: isValidFileWrapper,
    ...other,
  });

  const ShowRejectionItems = () => (
    <Paper
      variant="outlined"
      sx={{
        py: 1,
        px: 2,
        my: 2,
        borderColor: 'error.light',
        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
      }}
    >
      {fileRejections.map(({ file, errors }) => {
        const { path, size }: CustomFile = file;
        return (
          <Box key={path} sx={{ my: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {path} - {fData(size)}
            </Typography>
            {errors.map((e) => (
              <Typography key={e.code} variant="caption" component="p">
                - {e.message}
              </Typography>
            ))}
          </Box>
        );
      })}
    </Paper>
  );

  return (
    <div style={hasTitle ? {} : { position: 'relative' }}>
      <RootStyle sx={sx}>
        <DropZoneStyle
          {...getRootProps()}
          sx={{
            ...(isDragActive && { opacity: 0.72 }),
            ...((isDragReject || error) && {
              color: 'error.main',
              borderColor: 'error.light',
              bgcolor: 'error.lighter',
            }),
          }}
        >
          <input {...getInputProps()} />

          {file && (
            <Image
              alt="avatar"
              src={isString(file) ? file : file.preview}
              sx={{ zIndex: 8, '& img': { objectFit: 'cover !important' } }}
            />
          )}

          <PlaceholderStyle
            className="placeholder"
            sx={{
              ...(file && {
                opacity: 0,
                color: 'common.white',
                bgcolor: 'grey.900',
                '&:hover': { opacity: 0.72 },
              }),
            }}
          >
            {placeholder && !file ? (
              placeholder
            ) : (
              <>
                <Iconify icon={'ic:round-add-a-photo'} sx={{ width: 24, height: 24, mb: 1 }} />
                <Typography variant="caption">{file ? 'Update photo' : 'Upload photo'}</Typography>
              </>
            )}
          </PlaceholderStyle>
        </DropZoneStyle>
      </RootStyle>

      {onDelete && file && (
        <IconButton
          color="error"
          sx={{
            top: hasTitle ? 18 : 0,
            right: hasTitle ? 18 : 0,
            zIndex: 9,
            position: 'absolute',
          }}
          onClick={onDelete}
        >
          <Iconify icon={'eva:trash-2-outline'} width={18} height={18} />
        </IconButton>
      )}

      {caption}

      {fileRejections.length > 0 && <ShowRejectionItems />}
    </div>
  );
}
