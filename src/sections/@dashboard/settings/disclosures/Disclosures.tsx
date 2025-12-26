import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { Grid, Card, Stack, Typography } from '@mui/material';
// @types
import { DisclosureType } from '../../../../@types/disclosure';
// components
import { UploadMultiFile } from 'components/upload';
// redux
import { useSelector } from 'redux/store';
import { getDisclosures, createDisclosures, deleteDisclosure } from 'redux/slices/disclosures';
// sections
import DisclosureListTable from 'sections/@dashboard/settings/disclosures/DisclosureListTable';
// constants
import { types } from 'constants/disclosures';
import { validateMime } from 'utils/files';
import { getDisclosureUserId } from 'utils/disclosures';

// ----------------------------------------------------------------------

type Props = {
  type: DisclosureType;
  userId: string;
};

export default function Disclosures({ type, userId }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [isThereAnError, setIsThereAnError] = useState<boolean | null>(false);

  const { firm } = useSelector((state) => state.firm);

  const {
    isLoading,
    firm: firmDisclosures,
    advisor: advisorDisclosures,
  } = useSelector((state) => state.disclosures);
  const disclosures =
    type === types.FIRM
      ? firmDisclosures
      : type === types.ADVISOR
      ? advisorDisclosures.filter((item) => getDisclosureUserId(item.key) === userId)
      : [];

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (firm.id) {
      getDisclosures(type, firm.id);
    }
  }, [enqueueSnackbar, type, firm.id]);

  const uploadFile = async () => {
    try {
      if (isThereAnError) throw new Error('Invalid file type');
      if (userId) {
        setLoading(true);
        await createDisclosures(type, firm.id, userId, files);
        setFiles([]);
        enqueueSnackbar(
          `${files.length === 1 ? 'Disclosure' : 'Disclosures'} uploaded successfully`,
          { variant: 'success' }
        );
        setLoading(false);
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    } catch (err: any) {
      setLoading(false);
      console.error('Error uploading disclosures', err);
      enqueueSnackbar(err.message || 'Something went wrong', { variant: 'error' });
    }
  };

  const removeFile = async (key: string) => {
    try {
      await deleteDisclosure(key, firm.id);
      enqueueSnackbar('Disclosure deleted successfully', { variant: 'success' });
    } catch (err) {
      console.error('Error deleting disclosure', err);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
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

      if (newFiles.length) {
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
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <Stack spacing={2} sx={{ py: 3, px: 3, pb: 1, width: 1, textAlign: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary' }}>
                Uploaded Disclosures
              </Typography>
            </div>
          </Stack>
          <DisclosureListTable
            disclosures={disclosures}
            onDeleteDisclosure={removeFile}
            loading={isLoading}
          />
        </Card>
      </Grid>

      <Grid item xs={12} md={12}>
        <Card sx={{ py: 3, px: 3, textAlign: 'left' }}>
          <Stack spacing={2} sx={{ width: 1, textAlign: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <Typography
                variant="overline"
                sx={{ display: 'block', mb: 3, color: 'text.secondary' }}
              >
                Add Disclosures
              </Typography>
              <UploadMultiFile
                showPreview={false}
                accept={{
                  'application/pdf': ['.pdf'],
                  // 'application/msword': ['.doc'],
                  // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
                  //   '.docx',
                  // ],
                }}
                files={files}
                note="Only PDFs are allowed"
                onDrop={handleDropMultiFile}
                onRemove={handleRemove}
                isLoading={loading}
                onRemoveAll={handleRemoveAll}
                onUpload={uploadFile}
              />
            </div>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
