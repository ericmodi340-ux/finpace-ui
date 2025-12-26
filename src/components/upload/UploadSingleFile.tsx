import { isString } from 'lodash';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { useSnackbar } from 'notistack';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Theme, Typography, Paper, IconButton, SxProps } from '@mui/material';
// utils
import { fData } from 'utils/formatNumber';
// components
import Iconify from 'components/Iconify';
import Image from 'components/Image';
import { isValidFile } from '../../utils/files';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  display: 'flex',
  overflow: 'hidden',
  textAlign: 'center',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(5, 0),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create('padding'),
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': {
    opacity: 0.72,
    cursor: 'pointer',
  },
  [theme.breakpoints.up('md')]: { textAlign: 'left', flexDirection: 'row' },
}));

const IconStyle = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  [theme.breakpoints.up('md')]: { marginLeft: theme.spacing(3) },
}));

// ----------------------------------------------------------------------

interface CustomFile extends File {
  path?: string;
  preview?: string;
}

interface Props extends DropzoneOptions {
  error?: boolean;
  file: CustomFile | string | null;
  onDelete?: (() => void) | null;
  sx?: SxProps<Theme>;
  isAvatar?: boolean;
}

export default function UploadSingleFile({
  error = false,
  file,
  onDelete,
  sx,
  isAvatar = true,
  ...other
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const isValidFileWrapper = (file: any) => isValidFile(file, enqueueSnackbar, isAvatar);

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
        mt: 3,
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
    <Box sx={{ width: '100%', ...sx }}>
      <DropZoneStyle
        {...getRootProps()}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...((isDragReject || error) && {
            color: 'error.main',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
          }),
          ...(file && { padding: '12% 0', minHeight: '210px' }),
        }}
      >
        <input {...getInputProps()} />

        {!file && (
          <>
            <IconStyle>
              <Iconify icon={'ic:round-add-a-photo'} sx={{ width: 24, height: 24, mb: 1 }} />
            </IconStyle>

            <Box sx={{ p: 3 }}>
              <Typography gutterBottom variant="h6">
                Drop or select file
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Drop files here or click to&nbsp;
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ color: 'primary.main', textDecoration: 'underline' }}
                >
                  browse
                </Typography>
                &nbsp; your files
              </Typography>
            </Box>
          </>
        )}

        {file && (
          <Image
            alt="file preview"
            src={isString(file) ? file : file.preview}
            sx={{
              top: 12,
              borderRadius: 1,
              objectFit: 'contain',
              position: 'absolute',
              width: 'calc(100% - 24px)',
              height: 'calc(100% - 24px)',
            }}
          />
        )}
      </DropZoneStyle>

      {onDelete && file && (
        <IconButton
          color="error"
          sx={{
            top: 18,
            right: 18,
            zIndex: 9,
            position: 'absolute',
          }}
          onClick={onDelete}
        >
          <Iconify icon={'eva:trash-2-outline'} width={18} height={18} />
        </IconButton>
      )}

      {fileRejections.length > 0 && <ShowRejectionItems />}
    </Box>
  );
}
