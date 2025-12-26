import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { DialogActions, Box, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { UploadMultiFile } from 'components/upload';
// redux
import { createDisclosures } from 'redux/slices/disclosures';
// constants
import { validateMime } from 'utils/files';
// hooks
import useAuth from 'hooks/useAuth';
import useUser from 'hooks/useUser';
// types
import { DisclosureType } from '../../../../../@types/disclosure';
import { UserRole } from '../../../../../@types/user';
import { useSelector } from 'redux/store';
import { getDisclosureName } from 'utils/disclosures';

interface AdvisorDocsProps {
  onContinue: () => void;
  setAdvisorDocs: Dispatch<SetStateAction<{ link: string; name: string }[]>>;
}

function FormAdvisorDocs({ onContinue, setAdvisorDocs }: AdvisorDocsProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [isThereAnError, setIsThereAnError] = useState<boolean | null>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const { user: userFromAuth } = useAuth();
  const { user } = useUser();
  const { firm } = useSelector((state) => state.firm);

  const uploadFile = async () => {
    const type =
      userFromAuth?.role === UserRole.FIRM_ADMIN ? DisclosureType.FIRM : DisclosureType.ADVISOR;
    try {
      if (isThereAnError) throw new Error('Invalid file type');
      if (user?.id) {
        setIsLoading(true);
        const response = await createDisclosures(type, firm.id, user.id, files);
        const formatData =
          response?.map(({ key }) => {
            const name = getDisclosureName(key);
            const currentDate = new Date();

            return { link: key, name: `${name}-${currentDate}` };
          }) || [];
        setAdvisorDocs(formatData);
        setFiles([]);
        enqueueSnackbar(
          `${files.length === 1 ? 'Disclosure' : 'Disclosures'} uploaded successfully`,
          { variant: 'success' }
        );
        onContinue();
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    } catch (err: any) {
      console.error('Error uploading disclosures', err);
      enqueueSnackbar(err.message || 'Something went wrong', { variant: 'error' });
    }
    setIsLoading(false);
  };

  const handleDropMultiFile = useCallback(
    (acceptedFiles: File[]) => {
      const maximumNumberOfFiles = 10;
      let newFiles: File[] = [];

      if (files.length + newFiles.length >= maximumNumberOfFiles) {
        enqueueSnackbar('Maximum number of files reached', { variant: 'warning' });
        return [];
      }

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
    <>
      <Box sx={{ width: '70%', margin: 'auto', minHeight: '210px' }}>
        <Typography variant="h6" fontWeight="300" sx={{ mb: 3 }}>
          Please include financial statements your advisor requested here
        </Typography>
        <UploadMultiFile
          showPreview={false}
          accept={{
            'application/pdf': ['.pdf'],
          }}
          note="Only PDFs are allowed"
          files={files}
          onDrop={handleDropMultiFile}
          onRemove={handleRemove}
          onRemoveAll={handleRemoveAll}
          onUpload={uploadFile}
          uploadButtonText="Upload & continue"
          isLoading={isLoading}
        />

        <DialogActions sx={{ justifyContent: 'center' }}>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading || files.length !== 0}
            loadingIndicator="Loading..."
            sx={{ width: '277px' }}
            data-test="form-advisor-docs-submit-button"
            onClick={() => onContinue()}
          >
            Continue
          </LoadingButton>
        </DialogActions>
      </Box>
    </>
  );
}

export default FormAdvisorDocs;
