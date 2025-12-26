import {
  IconButton,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Storage } from 'aws-amplify';
import { S3ProviderListOutputItem } from '@aws-amplify/storage';
import Iconify from 'components/Iconify';
import { createStorageItem, deleteStorageItem, getStorageItem } from 'redux/slices/storage';
import { UploadMultiFile } from 'components/upload';
import { useSnackbar } from 'notistack';
import { validateMime } from 'utils/files';
import { LoadingButton } from '@mui/lab';

type Props = {
  path: string;
};

const MultiUpload = ({ path }: Props) => {
  const [docuvaultList, setDocuvaultList] = useState<S3ProviderListOutputItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [isThereAnError, setIsThereAnError] = useState<boolean | null>(false);

  const getDocuvaultList = useCallback(
    async (path: string) => {
      try {
        setLoading(true);
        const response = await Storage.list(path, {
          pageSize: 'ALL',
        });
        setDocuvaultList(response.results.filter((item) => item.size !== 0));
      } catch (err) {
        console.error(err);
        enqueueSnackbar('Something went wrong!', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    getDocuvaultList(path);
  }, [path, getDocuvaultList]);

  const handleDownload = async (key: string) => {
    if (key) {
      const resp = await getStorageItem({ path: key, isPublic: true });
      const link = document.createElement('a');
      link.href = resp;
      link.setAttribute('download', key.split('/').pop() || 'file');
      document.body.appendChild(link);
      link.click();
    }
  };

  const uploadFile = async () => {
    try {
      if (isThereAnError) throw new Error('Invalid file type');
      if (path) {
        setIsUploading(true);
        const uploadPromises = files.map(async (file: any) => {
          await createStorageItem({
            path: `${path}/${file.name}`,
            file: file,
            contentType: file.type,
          });
        });
        await Promise.all(uploadPromises);
        setIsUploading(false);
        await getDocuvaultList(path);
        setFiles([]);
        enqueueSnackbar(
          `${files.length === 1 ? 'Disclosure' : 'Disclosures'} uploaded successfully`,
          { variant: 'success' }
        );
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    } catch (err: any) {
      console.error('Error uploading disclosures', err);
      setIsUploading(false);
      enqueueSnackbar(err.message || 'Something went wrong', { variant: 'error' });
    }
  };

  const handleDropMultiFile = useCallback(
    (acceptedFiles: File[]) => {
      let newFiles: File[] = [];

      newFiles = acceptedFiles.flatMap((acceptedFile: File) => {
        // Check file hasn't already been uploaded
        let fileExists = files.find((file: File) => file.name === acceptedFile.name);
        if (fileExists) {
          enqueueSnackbar('File already exists', { variant: 'warning' });
          return [];
        }

        return Object.assign(acceptedFile, {
          preview: URL.createObjectURL(acceptedFile),
        });
      });

      if (!!newFiles.length) {
        setFiles((initialAcceptedFiles) => [...initialAcceptedFiles, ...newFiles]);
      }
    },
    [files, enqueueSnackbar]
  );

  const handleRemoveAll = () => {
    setFiles([]);
  };

  const handleRemove = (file: File | string) => {
    const filteredItems = files.filter((_file) => _file !== file);
    setFiles(filteredItems);
  };

  useEffect(() => {
    setIsThereAnError(false);
    files.map(async (file: any) => {
      const cb = async (isValid: boolean) => {
        if (!isValid) setIsThereAnError(true);
      };

      validateMime(file, cb);
    });
  }, [files]);

  return (
    <div>
      {loading ? (
        <Stack mx={'auto'} my={3} justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {!!docuvaultList.length && (
            <List
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              {docuvaultList.map((item) => (
                <ListItem
                  key={item.key}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => handleDownload(item?.key || '')}>
                        <Iconify icon="material-symbols:download" />
                      </IconButton>
                      <DeleteDocuvaultFile row={item} setDocuvaultList={setDocuvaultList} />
                    </Stack>
                  }
                >
                  <ListItemText primary={item?.key?.split('/').pop()} />
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}
      <UploadMultiFile
        simple
        showPreview={false}
        accept={{
          'application/pdf': ['.pdf'],
        }}
        multiple
        sx={{ mt: 2 }}
        files={files}
        note="Only PDFs are allowed"
        onDrop={handleDropMultiFile}
        disabled={isUploading}
        uploadButtonText={isUploading ? 'Uploading...' : 'Upload'}
        onRemove={handleRemove}
        onRemoveAll={handleRemoveAll}
        onUpload={uploadFile}
      />
    </div>
  );
};

function DeleteDocuvaultFile({ row, setDocuvaultList }: any) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!row?.key) return;
    setLoading(true);
    await deleteStorageItem({
      path: row?.key || '',
    });
    setDocuvaultList((prev: any) => prev.filter((item: any) => item.key !== row?.key));
    setLoading(false);
    setDeleteConfirmOpen(false);
  }, [row?.key, setDocuvaultList]);

  return (
    <>
      <IconButton onClick={() => setDeleteConfirmOpen(true)}>
        <Iconify icon="material-symbols:delete-outline" />
      </IconButton>
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
export default MultiUpload;
