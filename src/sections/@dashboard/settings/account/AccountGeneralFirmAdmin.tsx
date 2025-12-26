import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useState, useCallback } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
import { sentenceCase } from 'change-case';
// @mui
import { Box, Grid, Card, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { FirmAdminManager } from '../../../../@types/firmAdmin';
import { UserRole } from '../../../../@types/user';
import { ClientManager, ClientsState } from '../../../../@types/client';
// components
import Tip from 'components/Tip';
import ProfileFollowInfo from 'components/ProfileFollowInfo';
// redux
import { updateFirmAdmin } from 'redux/slices/firmAdmins';
import { createStorageItem, deleteStorageItem, getStorageItem, setUrl } from 'redux/slices/storage';
import { updateUserSuccess } from 'redux/slices/user';
import { dispatch, useSelector } from 'redux/store';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUser from 'hooks/useUser';
import useStorageAvatar from 'hooks/useStorageAvatar';
// utils
import { getImagePath } from 'utils/storage';
import arrayFromObj from 'utils/arrayFromObj';
import { getTotalAumFromCLients } from 'utils/getAum';
// constants
import { roles } from 'constants/users';
// config
import UploadAvatarWrapper from '../../../../components/upload/UploadAvatarWrapper';
import { validateMime } from 'utils/files';
import SocialLinks from 'components/SocialLinks';
import { maskPhoneNumber, unmaskPhoneNumber } from 'utils/numbers';

// ----------------------------------------------------------------------

interface InitialState extends Partial<FirmAdminManager> {
  afterSubmit?: string;
}

export default function AccountGeneralFirmAdmin() {
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();
  const { authUser, user: dbUser } = useUser();
  const userId = authUser?.sub;
  const user = dbUser as FirmAdminManager;
  const clients = useSelector((state) => state.clients) as ClientsState;
  const clientsArray = arrayFromObj(clients.byId, clients.allIds).filter(
    (client) => !client.isProspect
  ) as ClientManager[];
  const clientsTotalAUM = getTotalAumFromCLients(clientsArray);

  const defaultAvatarPath = getImagePath({
    userType: roles.FIRM_ADMIN as UserRole.FIRM_ADMIN,
    userId: userId,
    imageType: 'avatar',
  });
  const [avatarPath, setAvatarPath] = useState(defaultAvatarPath);
  const { avatarUrl } = useStorageAvatar({ path: avatarPath });

  const UpdateUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    phoneNumber: Yup.string().matches(/^\D*\d{3}\D*\d{3}\D*\d{4}$/, 'Must be a 10-digit number'),
    crd: Yup.string(),
    masterAccountNumber: Yup.string(),
  });

  const formik = useFormik<InitialState>({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      crd: user?.crd || '',
      masterAccountNumber: user?.masterAccountNumber || '',
      phoneNumber: maskPhoneNumber(user?.phoneNumber || ''),
      socialMedia: {
        facebook: user?.socialMedia?.facebook ?? '',
        instagram: user?.socialMedia?.instagram ?? '',
        linkedin: user?.socialMedia?.linkedin ?? '',
        twitter: user?.socialMedia?.twitter ?? '',
        youtube: user?.socialMedia?.youtube ?? '',
      },
    },
    validationSchema: UpdateUserSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        setSubmitting(true);
        await updateFirmAdmin(userId, {
          ...values,
          phoneNumber: unmaskPhoneNumber(values.phoneNumber || ''),
        });
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

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps, setFieldValue } = formik;

  const updateAvatarImage = async (url: string) => {
    const updateUser = {
      id: userId,
      avatarUrl: url,
    };
    dispatch(updateUserSuccess({ role: authUser?.role, updateUser }));
    // Get newUrl and set it on the redux state
    const newUrl = await getStorageItem({ path: url, isPublic: true });
    dispatch(setUrl({ path: url, url: newUrl }));
  };

  const handleDropSingleFile = useCallback(
    (fieldId: any, acceptedFiles: any) => {
      const uploadFile = async (fieldId: string, path: string, file: File) => {
        const cb = async (isValid: boolean) => {
          try {
            if (!isValid) throw new Error('Invalid file type');
            await createStorageItem({ path, file });

            // Force rerender of useStorage() hooks
            switch (fieldId) {
              case 'avatar':
                setAvatarPath('');
                setAvatarPath(defaultAvatarPath);
                break;
              default:
                break;
            }
            // User state is updated to rerender the avatar image
            updateAvatarImage(path);

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
            userType: roles.FIRM_ADMIN as UserRole.FIRM_ADMIN,
            userId: userId,
            imageType: fieldId,
          }) || '',
          file
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultAvatarPath, enqueueSnackbar, userId]
  );

  const handleDeleteSingleFile = async (fieldId: string, path: string | undefined) => {
    if (!path) {
      return;
    }

    try {
      await deleteStorageItem({ path });

      // Force refresh of useStorage() hooks
      switch (fieldId) {
        case 'avatar':
          setAvatarPath('');
          break;
        default:
          break;
      }
      // User state is updated to rerender the avatar image
      updateAvatarImage('');

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
          <Grid item xs={12} md={4}>
            <ProfileFollowInfo totalClients={clientsArray.length} totalAUM={clientsTotalAUM} />
            <Card sx={{ py: 3, px: 3, textAlign: 'left' }}>
              <Typography variant="overline" sx={{ mb: 3, color: 'text.secondary' }}>
                Avatar
              </Typography>
              <Tip
                title={
                  <>
                    <Typography color="inherit">Where does this show?</Typography>
                    Your uploaded avatar will appear:
                    <ul style={{ listStyle: 'disc', marginLeft: 8, paddingLeft: 16 }}>
                      <li>
                        in firm admin user lists and your profile page in firm admin dashboards
                      </li>
                    </ul>
                  </>
                }
                sx={{ ml: 1, mt: '-1px', p: 0, '& svg': { width: 16, height: 16 } }}
              />
              <Stack spacing={2} sx={{ pt: 9, pb: 6, mt: -6, width: 1, textAlign: 'center' }}>
                <UploadAvatarWrapper
                  handleDropSingleFile={handleDropSingleFile}
                  handleDeleteSingleFile={handleDeleteSingleFile}
                  avatarUrl={avatarUrl}
                  avatarPath={avatarPath}
                  hasTitle
                />
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={{ xs: 2, md: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField fullWidth label="Name" {...getFieldProps('name')} />
                  <TextField fullWidth disabled label="Email Address" {...getFieldProps('email')} />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    {...getFieldProps('phoneNumber')}
                    onChange={(event) => {
                      const { value } = event.target;
                      setFieldValue('phoneNumber', maskPhoneNumber(value));
                    }}
                    error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                    helperText={touched.phoneNumber && errors.phoneNumber}
                  />
                  <TextField fullWidth label="CRD" {...getFieldProps('crd')} />
                </Stack>
                <TextField
                  fullWidth
                  label="Master Account Number"
                  {...getFieldProps('masterAccountNumber')}
                />
              </Stack>
            </Card>
            <Box sx={{ mt: 3 }}>
              <SocialLinks getFieldProps={getFieldProps} />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
