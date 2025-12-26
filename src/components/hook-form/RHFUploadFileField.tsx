import {
  Box,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { getImagePath } from 'utils/storage';
import Iconify from 'components/Iconify';
import { roles } from 'constants/users';
import { createStorageItem, deleteStorageItem, getStorageItem } from 'redux/slices/storage';
import { UserRole } from '../../@types/user';
import { LoadingButton } from '@mui/lab';

export default function RHFUploadFileField({
  fieldId,
  clientId,
  accept = '',
}: {
  fieldId: string;
  clientId: string;
  accept?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [file, setFile] = useState<File | null>();
  const theme = useTheme();
  const [fetchedFile, setFetchedFile] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    async function fetchFile() {
      const defaultFilePath = getImagePath({
        userType: roles.CLIENT as UserRole.CLIENT,
        userId: clientId,
        imageType: fieldId,
      });
      try {
        setIsFetching(true);
        const response = await getStorageItem({ path: defaultFilePath || '' });
        setFetchedFile(response);
      } catch {
        setFetchedFile(null);
      }
      setIsFetching(false);
    }
    fetchFile();
  }, [clientId, fieldId]);

  const uploadFile = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const defaultFilePath = getImagePath({
        userType: roles.CLIENT as UserRole.CLIENT,
        userId: clientId,
        imageType: fieldId,
      });
      const response = await createStorageItem({
        path: defaultFilePath || '',
        file,
      });
      setFile(null);
      const newUrl = await getStorageItem({ path: response.key || '' });
      setFetchedFile(newUrl);
      enqueueSnackbar('Attachment uploaded', {
        variant: 'success',
      });
      setLoading(false);
      return response;
    } catch (err: any) {
      console.error('Error uploading the file', err);
      enqueueSnackbar(err.message || 'Something went wrong', { variant: 'error' });
    }
    setLoading(false);
  };

  const onChange = (event: any) => {
    let newFile = event.target.files[0];
    newFile.preview = URL.createObjectURL(newFile);
    setFile(newFile);
  };

  function trimFileName(str: string, chars: number) {
    var split = str.split('.');
    var filename = split[0];
    var extension = split[1];
    if (filename.length > chars) {
      filename = filename.substring(0, chars);
      filename += '...';
    }
    return filename + '.' + extension;
  }

  const handleDelete = async () => {
    setFile(null);
    const defaultFilePath = getImagePath({
      userType: roles.CLIENT as UserRole.CLIENT,
      userId: clientId,
      imageType: fieldId,
    });
    setLoading(true);
    await deleteStorageItem({ path: defaultFilePath || '' });
    setLoading(false);
    setFetchedFile(null);
    setDeleteConfirmOpen(false);
  };

  if (isFetching) return null;

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        border={fetchedFile || file ? 1 : 0}
        width="100%"
        borderRadius={1}
        borderColor="grey.300"
      >
        {!fetchedFile &&
          (file ? (
            <Box mx={2} display="flex" justifyContent="space-between" width="100%">
              {/* file upload icon */}
              <Typography color="text.primary" fontSize={15}>
                {trimFileName(file.name, 10)}
              </Typography>
              <Box display="flex" alignItems="center">
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    <Iconify
                      onClick={uploadFile}
                      color="text.primary"
                      width={20}
                      height={20}
                      sx={{ cursor: 'pointer' }}
                      icon="eva:upload-fill"
                    />
                    <Iconify
                      color="gray"
                      width={20}
                      marginLeft={1}
                      height={20}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setFile(null)}
                      icon="material-symbols:delete-outline"
                    />
                  </>
                )}
              </Box>
            </Box>
          ) : (
            <Button fullWidth size="large" variant="outlined" component="label">
              <input hidden accept={accept} type="file" onChange={onChange} />
              <Iconify color="text.primary" width={20} height={20} icon="eva:attach-2-fill" />
              <Typography color="text.primary" fontSize={15} marginLeft={1}>
                Attach file
              </Typography>
            </Button>
          ))}
        {fetchedFile && (
          <Box mx={2} display="flex" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center">
              <Iconify
                color={theme.palette.success.main}
                width={20}
                height={20}
                marginRight={1}
                icon="eva:checkmark-circle-2-fill"
              />
              <Typography color="text.primary" fontSize={15}>
                File Uploaded
              </Typography>
            </Box>

            <Box display="flex" alignItems="center">
              <Iconify
                color="gray"
                width={20}
                height={20}
                sx={{ cursor: 'pointer' }}
                onClick={async () => window.open(fetchedFile)}
                icon="eva:download-fill"
              />
              <Iconify
                color="gray"
                width={20}
                height={20}
                marginLeft={1}
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  setDeleteConfirmOpen(true);
                }}
                icon="material-symbols:delete-outline"
              />
            </Box>
          </Box>
        )}
      </Box>
      <Dialog open={deleteConfirmOpen} maxWidth="xs">
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>This will permanently delete the file.</strong> This user will no longer be able
            to recover the file.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <LoadingButton
            color="error"
            variant="contained"
            disabled={loading}
            loading={loading}
            onClick={handleDelete}
            sx={{ textTransform: 'none' }}
          >
            Yes, delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
