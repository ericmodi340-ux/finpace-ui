import { isString } from 'lodash';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { useSnackbar } from 'notistack';
// @ts-ignore
import { m, AnimatePresence } from 'framer-motion';
// @mui
import { alpha, Theme, styled } from '@mui/material/styles';
import {
  Box,
  List,
  Stack,
  Paper,
  Button,
  ListItem,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  SxProps,
} from '@mui/material';
// utils
import { fData } from '../../utils/formatNumber';
// assets
import { UploadIllustration } from '../../assets';
//
import Image from '../Image';
import Iconify from '../Iconify';
import { varFade } from '../animate';
import { isValidFile } from '../../utils/files';
import LogoLoading from '../LogoLoading';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  display: 'flex',
  textAlign: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(1, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
  [theme.breakpoints.up('md')]: { textAlign: 'left', flexDirection: 'row' },
}));

// ----------------------------------------------------------------------

interface CustomFile extends File {
  path?: string;
  preview?: string;
}

const getFileData = (file: CustomFile | string) => {
  if (typeof file === 'string') {
    return {
      key: file,
    };
  }
  return {
    key: file.name,
    name: file.name,
    size: file.size,
    preview: file.preview,
  };
};

interface Props extends DropzoneOptions {
  error?: boolean;
  files: (File | string)[];
  showPreview: boolean;
  onRemove: (file: File | string) => void;
  onRemoveAll: VoidFunction;
  sx?: SxProps<Theme>;
  onUpload?: () => void;
  uploadButtonText?: string;
  isLoading?: boolean;
  showButtons?: boolean;
  disabled?: boolean;
  note?: string;
  simple?: boolean;
}

export default function UploadMultiFile({
  error,
  showPreview = false,
  files,
  onRemove,
  simple = false,
  onRemoveAll,
  sx,
  onUpload,
  uploadButtonText = 'Upload',
  isLoading = false,
  showButtons = true,
  disabled,
  note,
  multiple,
  ...other
}: Props) {
  const hasFile = files.length > 0;
  const { enqueueSnackbar } = useSnackbar();
  const isValidFileWrapper = (file: any) => isValidFile(file, enqueueSnackbar, false);

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    validator: isValidFileWrapper,
    multiple,
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
        }}
      >
        <input {...getInputProps()} />

        {simple ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 1 }}>
            <Iconify icon="eva:cloud-upload-fill" width={28} />
            <Typography gutterBottom variant="subtitle1">
              Drop or Select file
            </Typography>
          </Stack>
        ) : (
          <>
            <UploadIllustration sx={{ width: 220 }} />

            <Box sx={{ p: 3, ml: { md: 2 } }}>
              <Typography gutterBottom variant="h5">
                Drop or Select file
              </Typography>
              <Typography variant="h6" color="info">
                {note}
              </Typography>
              {multiple && (
                <Typography variant="body1" color="gray" sx={{ fontStyle: 'italic' }}>
                  Maximum 10 files. Each file size has a limit of 10.1MB
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Drop files here or click to&nbsp;
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ color: 'primary.main', textDecoration: 'underline' }}
                >
                  browse
                </Typography>
                &nbsp;through your machine
              </Typography>
            </Box>
          </>
        )}
      </DropZoneStyle>

      {fileRejections.length > 0 && <ShowRejectionItems />}

      <List disablePadding sx={{ ...(hasFile && { my: 3 }) }}>
        <AnimatePresence>
          {files.map((file) => {
            const { key, name, size, preview } = getFileData(file as CustomFile);

            if (showPreview) {
              return (
                <ListItem
                  key={key}
                  component={m.div}
                  {...varFade().inRight}
                  sx={{
                    p: 0,
                    m: 0.5,
                    width: 80,
                    height: 80,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'inline-flex',
                  }}
                >
                  <Image src={isString(file) ? file : preview} ratio="1/1" />
                  <Box sx={{ top: 6, right: 6, position: 'absolute' }}>
                    <IconButton
                      size="small"
                      onClick={() => onRemove(file)}
                      sx={{
                        p: '2px',
                        color: 'common.white',
                        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                        },
                      }}
                    >
                      <Iconify icon={'eva:close-fill'} />
                    </IconButton>
                  </Box>
                </ListItem>
              );
            }

            return (
              <ListItem
                key={key}
                component={m.div}
                {...varFade().inRight}
                sx={{
                  my: 1,
                  py: 0.75,
                  px: 2,
                  borderRadius: 1,
                  border: (theme: any) => `solid 1px ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <ListItemIcon>
                  <Iconify icon={'eva:file-fill'} width={28} height={28} />
                </ListItemIcon>
                <ListItemText
                  primary={isString(file) ? file : name}
                  secondary={isString(file) ? '' : fData(size || 0)}
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" size="small" onClick={() => onRemove(file)}>
                    <Iconify icon={'eva:close-fill'} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </AnimatePresence>
      </List>

      {hasFile && !isLoading && showButtons && (
        <Stack direction="row" justifyContent="flex-end">
          <Button onClick={onRemoveAll} sx={{ mr: 1.5 }}>
            Remove all
          </Button>
          <Button variant="contained" disabled={disabled} onClick={onUpload}>
            {uploadButtonText}
          </Button>
        </Stack>
      )}
      {isLoading && <LogoLoading startWhiteLabel sx={{ width: 180, height: 'auto', mx: 'auto' }} />}
    </Box>
  );
}
