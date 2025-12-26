import * as Yup from 'yup';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { sentenceCase } from 'change-case';
// @mui
import { Box, Card, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
// @types
import { FirmAdminManager } from '../../../../@types/firmAdmin';
import { UserRole, UserStatus } from '../../../../@types/user';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// components
import Label from 'components/Label';
// redux
import { createFirmAdmin, updateFirmAdmin } from 'redux/slices/firmAdmins';
import { createStorageItem, deleteStorageItem } from 'redux/slices/storage';
// hooks
import useStorage from 'hooks/useStorage';
import useUser from 'hooks/useUser';
// utils
import { getImagePath } from 'utils/storage';
import { fDateTime } from 'utils/formatTime';
// constants
import { roles, statuses } from 'constants/users';
// config
import UploadAvatarWrapper from '../../../../components/upload/UploadAvatarWrapper';
import { validateMime } from 'utils/files';
import { useForm } from 'react-hook-form';
import FormProvider from 'components/hook-form/FormProvider';
import { RHFAutocomplete, RHFSwitch, RHFTextField } from 'components/hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { SocialLinks } from 'sections/@dashboard/client/profile/ClientInfoFormCard';
import { phoneMask } from 'utils/masks';
import { updateAdvisorSuccess } from 'redux/slices/advisors';
import { useDispatch } from 'redux/store';

// ----------------------------------------------------------------------

type FirmAdminGeneralProps = {
  isEdit: boolean;
  currentFirmAdmin?: FirmAdminManager;
  firmAdminId: string;
};

export default function FirmAdminGeneral({
  isEdit,
  currentFirmAdmin,
  firmAdminId,
}: FirmAdminGeneralProps) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();
  const dispatch = useDispatch();

  const [selectedTab, setSelectedTab] = useState('details');

  const defaultAvatarPath = getImagePath({
    userType: roles.FIRM_ADMIN as UserRole.FIRM_ADMIN,
    userId: firmAdminId,
    imageType: 'avatar',
  });
  const [avatarPath, setAvatarPath] = useState(defaultAvatarPath);
  const { url: avatarUrl } = useStorage({ path: avatarPath });

  const NewFirmAdminSchema = Yup.object().shape({
    name: Yup.string().when('dummy', {
      is: () => isEdit === true,
      then: Yup.string().required('Name is required'),
    }),
    email: Yup.string().required('Email is required').email(),
    crd: Yup.string(),
    masterAccountNumber: Yup.string(),
    status: Yup.boolean(),
    managementFees: Yup.object().shape({
      details: Yup.string(),
      timing: Yup.string(),
      valuation: Yup.string(),
      frequency: Yup.string(),
    }),
  });

  const initialValues = useMemo(
    () => ({
      name: currentFirmAdmin?.name || '',
      email: currentFirmAdmin?.email || '',
      isAdvisor: currentFirmAdmin?.isAdvisor || false,
      crd: currentFirmAdmin?.crd || '',
      masterAccountNumber: currentFirmAdmin?.masterAccountNumber || '',
      status: currentFirmAdmin?.status === statuses.INACTIVE ? false : true,
      isVerified: currentFirmAdmin?.isVerified || false,
      socialMedia: currentFirmAdmin?.socialMedia || {
        facebook: '',
        instagram: '',
        linkedin: '',
        twitter: '',
        youtube: '',
      },
      managementFees: {
        details: currentFirmAdmin?.managementFees?.details ?? '',
        timing: currentFirmAdmin?.managementFees?.timing ?? '',
        valuation: currentFirmAdmin?.managementFees?.valuation ?? '',
        frequency: currentFirmAdmin?.managementFees?.frequency ?? '',
      },
      phoneNumber: currentFirmAdmin?.phoneNumber ?? '',
    }),
    [currentFirmAdmin]
  );

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(NewFirmAdminSchema),
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    reset,
  } = methods;

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const isCurrentUser = user?.id === firmAdminId;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const newFirmAdmin = {
        ...data,
        status: data.status
          ? (statuses.ACTIVE as UserStatus.ACTIVE)
          : (statuses.INACTIVE as UserStatus.INACTIVE),
      };
      if (!isEdit) {
        const response = await createFirmAdmin(newFirmAdmin);
        if (response?.id) {
          navigate(`${PATH_DASHBOARD['firm-admins'].root}/${response.id}`);
        } else {
          enqueueSnackbar('Something went wrong!', { variant: 'error' });
        }
      } else {
        await updateFirmAdmin(firmAdminId, newFirmAdmin);
        dispatch(
          updateAdvisorSuccess({
            advisorId: firmAdminId,
            updateAdvisor: newFirmAdmin,
          })
        );
      }
      enqueueSnackbar(!isEdit ? 'Firm admin was created!' : 'Firm admin was updated!', {
        variant: 'success',
      });
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  });

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
            userId: firmAdminId,
            imageType: fieldId,
          }) || '',
          file
        );
      }
    },
    [defaultAvatarPath, enqueueSnackbar, firmAdminId]
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

      enqueueSnackbar(`${sentenceCase(fieldId)} deleted successfully`, { variant: 'success' });
    } catch (err) {
      console.error(`Error deleting ${fieldId}`, err);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, pb: 3, px: 3 }}>
            {isEdit && (
              <Label
                color={watch('status') ? 'error' : 'success'}
                sx={{ textTransform: 'uppercase', position: 'absolute', top: 24, right: 24 }}
              >
                {watch('status') ? 'active' : 'inactive'}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <UploadAvatarWrapper
                handleDropSingleFile={handleDropSingleFile}
                handleDeleteSingleFile={handleDeleteSingleFile}
                avatarUrl={avatarUrl}
                avatarPath={avatarPath}
                hasTitle={false}
              />
            </Box>

            <RHFSwitch
              name="isAdvisor"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Is also an advisor?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {watch('isAdvisor')
                      ? 'The admin is also an advisor.'
                      : 'The admin is not an advisor.'}
                  </Typography>
                </>
              }
              sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
            />

            {!isCurrentUser && (
              <>
                {isEdit && (
                  <RHFSwitch
                    name="status"
                    labelPlacement="start"
                    label={
                      <>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                          Active
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {watch('status')
                            ? "Toggling this off will disable the firm admin's account."
                            : "Toggling this on will enable the firm admin's account."}
                        </Typography>
                      </>
                    }
                    sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                  />
                )}

                <RHFSwitch
                  name="isVerified"
                  labelPlacement="start"
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Account Verified
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {watch('isVerified')
                          ? 'The admin has logged in to their dashboard.'
                          : 'The admin has not logged in to their dashboard yet.'}
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                />

                {currentFirmAdmin?.createdAt && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      color: 'text.secondary',
                    }}
                  >
                    Created {fDateTime(currentFirmAdmin.createdAt)}
                  </Typography>
                )}
              </>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <Tabs
              sx={{
                pl: 3,
                borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
              }}
              value={selectedTab}
              onChange={(e, value) => setSelectedTab(value)}
            >
              <Tab value="details" label="Account Details" />
              <Tab value="social" label="Social Media" />
            </Tabs>
            {selectedTab === 'details' && (
              <Stack sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField fullWidth name="name" label="Full Name" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      mask={phoneMask}
                      fullWidth
                      name="phoneNumber"
                      label="Phone Number"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      disabled={isCurrentUser}
                      helperText={
                        isCurrentUser
                          ? 'You can not change your email here! Visit change email section in your profile'
                          : ''
                      }
                      fullWidth
                      name="email"
                      label="Email Address"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField fullWidth name="crd" label="CRD" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      fullWidth
                      name="masterAccountNumber"
                      label="Master Account Number"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFAutocomplete
                      name="managementFees.timing"
                      label="Fee Timing"
                      options={['In Advance', 'In Arrears']}
                      getOptionLabel={(option) => option}
                      freeSolo
                      disableClearable
                      freeSoloCreate
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField
                      fullWidth
                      multiline
                      rows={3}
                      name="managementFees.details"
                      label="Management Fees"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="managementFees.valuation"
                      label="Fee Valuation"
                      options={['Average daily balance', 'Billing period ending value']}
                      getOptionLabel={(option) => option}
                      freeSolo
                      disableClearable
                      freeSoloCreate
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="managementFees.frequency"
                      label="Fee Frequency"
                      options={['Quarterly', 'Monthly']}
                      getOptionLabel={(option) => option}
                      freeSolo
                      disableClearable
                      freeSoloCreate
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}

            {selectedTab === 'social' && <SocialLinks />}
          </Card>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!isEdit ? 'Create Firm Admin' : 'Save Changes'}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
