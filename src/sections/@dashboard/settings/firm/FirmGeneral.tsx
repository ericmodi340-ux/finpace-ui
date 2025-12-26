import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useState, useCallback, useEffect } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
import { sentenceCase } from 'change-case';
// @mui
import { Box, Grid, Card, Stack, TextField, Typography, Autocomplete } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { FirmManager } from '../../../../@types/firm';
// components
import Tip from 'components/Tip';
import { UploadSingleFile } from 'components/upload';
// redux
import { dispatch, useSelector } from 'redux/store';
import { updateFirm } from 'redux/slices/firm';
import { createStorageItem, deleteStorageItem, getStorageItem, setUrl } from 'redux/slices/storage';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import useStorage from 'hooks/useStorage';
// utils
import { fData } from 'utils/formatNumber';
import { getImagePath } from 'utils/storage';
// config
import { ICON_MAX_SIZE, LOGO_MAX_SIZE } from 'config';
import { validateMime } from 'utils/files';

// ----------------------------------------------------------------------

interface InitialState extends Partial<FirmManager> {
  afterSubmit?: string;
}

const custodianOptions = ['Schwab', 'Fidelity', 'Pershing', 'Apex', 'Altruist'];

export default function FirmGeneral() {
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();
  const { firm } = useSelector((state) => state.firm);

  const defaultLogoPath = getImagePath({ userType: 'firm', userId: firm.id, imageType: 'logo' });
  const defaultIconPath = getImagePath({ userType: 'firm', userId: firm.id, imageType: 'icon' });
  const [logoPath, setLogoPath] = useState(defaultLogoPath);
  const [iconPath, setIconPath] = useState(defaultIconPath);
  const { url: logoUrl } = useStorage({ path: logoPath });
  const { url: iconUrl } = useStorage({ path: iconPath });

  useEffect(() => {
    if (defaultLogoPath) setLogoPath(defaultLogoPath);
    if (defaultIconPath) setIconPath(defaultIconPath);
  }, [defaultLogoPath, defaultIconPath]);

  const UpdateFirmSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    schwabServiceTeam: Yup.string(),
    custodian: Yup.string(),
    tamp: Yup.object().shape({
      firmName: Yup.string(),
      masterAccountNumber: Yup.string(),
    }),
  });

  const formik = useFormik<InitialState>({
    enableReinitialize: true,
    initialValues: {
      name: firm?.name || '',
      email: firm?.email || '',
      schwabServiceTeam: firm?.schwabServiceTeam || '',
      custodian: firm?.custodian || '',
      tamp: {
        firmName: firm?.tamp?.firmName || '',
        masterAccountNumber: firm?.tamp?.masterAccountNumber || '',
      },
    },
    validationSchema: UpdateFirmSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        setSubmitting(true);
        await updateFirm(firm?.id, values);
        enqueueSnackbar('Update success', { variant: 'success' });
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
        if (isMountedRef.current) {
          setSubmitting(false);
          setErrors({ afterSubmit: error.message });
        }
      }
    },
  });

  const { isSubmitting, handleSubmit, getFieldProps, setFieldValue, values } = formik;

  const handleDropSingleFile = useCallback(
    (fieldId: string, acceptedFiles: File[]) => {
      const uploadFile = async (fieldId: string, path: string, file: File) => {
        const cb = async (isValid: boolean) => {
          try {
            if (!isValid) throw new Error('Invalid file type');
            await createStorageItem({ path, file });

            // Force rerender of useStorage() hooks
            switch (fieldId) {
              case 'icon':
                setIconPath('');
                setIconPath(defaultIconPath);
                break;
              case 'logo':
                setLogoPath('');
                setLogoPath(defaultLogoPath);
                break;
              default:
                break;
            }
            // Get newUrl and set it on the redux state
            const newUrl = await getStorageItem({ path, isPublic: true });
            dispatch(setUrl({ path, url: newUrl }));
            enqueueSnackbar(`${sentenceCase(fieldId)} uploaded successfully`, {
              variant: 'success',
            });
          } catch (err: any) {
            console.error(`Error uploading ${fieldId}`, err);
            enqueueSnackbar(err.message || 'Something went wrong', { variant: 'error' });
          }
        };
        validateMime(file, cb);
      };

      let newFiles: File[] = [];

      newFiles = acceptedFiles.map((acceptedFile: File) =>
        Object.assign(acceptedFile, {
          preview: URL.createObjectURL(acceptedFile),
        })
      );

      if (newFiles.length) {
        const file = newFiles[0];
        uploadFile(
          fieldId,
          getImagePath({
            userType: 'firm',
            userId: firm.id,
            imageType: fieldId,
          }) || '',
          file
        );
      }
    },
    [defaultIconPath, defaultLogoPath, enqueueSnackbar, firm.id]
  );

  const handleDeleteSingleFile = async (fieldId: string, path: string | undefined) => {
    if (!path) {
      return;
    }

    try {
      await deleteStorageItem({ path });

      // Force refresh of useStorage() hooks
      switch (fieldId) {
        case 'icon':
          setIconPath('');
          break;
        case 'logo':
          setLogoPath('');
          break;
        default:
          break;
      }

      enqueueSnackbar(`${sentenceCase(fieldId)} deleted successfully`, { variant: 'success' });
    } catch (err) {
      console.error(`Error deleting ${fieldId}`, err);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                FIRM
              </Typography>

              <Grid container spacing={{ xs: 2, md: 3 }} sx={{ pt: 2 }}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Name" {...getFieldProps('name')} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email Address" {...getFieldProps('email')} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={custodianOptions}
                    value={values.custodian}
                    onChange={(_, newValue) => {
                      setFieldValue('custodian', newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Custodian" {...getFieldProps('custodian')} />
                    )}
                  />
                </Grid>

                {values.custodian === 'Schwab' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Schwab Service Team"
                        {...getFieldProps('schwabServiceTeam')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                        TAMP
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Firm Name" {...getFieldProps('tamp.firmName')} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Master Account Number"
                        {...getFieldProps('tamp.masterAccountNumber')}
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Save Changes
                </LoadingButton>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ py: 3, px: 3, textAlign: 'left' }}>
              <Typography variant="overline" sx={{ mb: 3, color: 'text.secondary' }}>
                Logo
              </Typography>
              <Tip
                title={
                  <>
                    <Typography color="inherit">Where does this show?</Typography>
                    Your uploaded logo will appear:
                    <ul style={{ listStyle: 'disc', marginLeft: 8, paddingLeft: 16 }}>
                      <li>on branded login pages</li>
                    </ul>
                  </>
                }
                sx={{ ml: 1, mt: '-1px', p: 0, '& svg': { width: 16, height: 16 } }}
              />
              <Stack spacing={2} sx={{ mt: 1, width: 1, textAlign: 'center' }}>
                <UploadSingleFile
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] }}
                  file={logoUrl}
                  maxSize={LOGO_MAX_SIZE}
                  onDrop={(files) => handleDropSingleFile('logo', files)}
                  onDelete={() => handleDeleteSingleFile('logo', logoPath)}
                />
                <Typography
                  variant="caption"
                  sx={{
                    mt: 2,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(LOGO_MAX_SIZE)}
                </Typography>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ py: 3, px: 3, textAlign: 'left' }}>
              <Typography variant="overline" sx={{ mb: 3, color: 'text.secondary' }}>
                Icon
              </Typography>
              <Tip
                title={
                  <>
                    <Typography color="inherit">Where does this show?</Typography>
                    Your uploaded icon will appear:
                    <ul style={{ listStyle: 'disc', marginLeft: 8, paddingLeft: 16 }}>
                      <li>on your dashboard as the icon in the upper left corner</li>
                      <li>on other firm admins dashboards as the icon in the upper left corner</li>
                      <li>on advisor dashboards as the icon in the upper left corner</li>
                      <li>on client/prospect dashboards as the icon in the upper left corner</li>
                      <li>in the "Your Firm" section of client/prospect client dashboards</li>
                    </ul>
                  </>
                }
                sx={{ ml: 1, mt: '-1px', p: 0, '& svg': { width: 16, height: 16 } }}
              />
              <Stack spacing={2} sx={{ mt: 1, width: 1, textAlign: 'center' }}>
                <UploadSingleFile
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] }}
                  file={iconUrl}
                  maxSize={ICON_MAX_SIZE}
                  onDrop={(files) => handleDropSingleFile('icon', files)}
                  onDelete={() => handleDeleteSingleFile('icon', iconPath)}
                />
                <Typography
                  variant="caption"
                  sx={{
                    mt: 2,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(ICON_MAX_SIZE)}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
