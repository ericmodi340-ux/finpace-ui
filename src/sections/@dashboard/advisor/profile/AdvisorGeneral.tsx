import * as Yup from 'yup';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { Link, useNavigate } from 'react-router-dom';
import { sentenceCase } from 'change-case';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Typography, Alert, Tabs, Tab } from '@mui/material';
// @types
import { UserRole, UserStatus } from '../../../../@types/user';
import { ClientManager, ClientsState } from '../../../../@types/client';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// @types
import { AdvisorManager } from '../../../../@types/advisor';
// components
import Label from 'components/Label';
import ProfileFollowInfo from 'components/ProfileFollowInfo';
// redux
import { createAdvisor, updateAdvisor } from 'redux/slices/advisors';
import { createStorageItem, deleteStorageItem, getStorageItem, setUrl } from 'redux/slices/storage';
// hooks
import useStorage from 'hooks/useStorage';
// utils
import { getImagePath } from 'utils/storage';
import { fDateTime } from 'utils/formatTime';
import arrayFromObj from 'utils/arrayFromObj';
import { getTotalAumFromCLients } from 'utils/getAum';
// constants
import { roles, statuses } from 'constants/users';
// config
import UploadAvatarWrapper from '../../../../components/upload/UploadAvatarWrapper';
import { validateMime } from 'utils/files';
import { useSelector } from 'redux/store';
import { maskPhoneNumber, unmaskPhoneNumber } from 'utils/numbers';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'components/hook-form/FormProvider';
import { RHFAutocomplete, RHFSwitch, RHFTextField } from 'components/hook-form';
import { SocialLinks } from 'sections/@dashboard/client/profile/ClientInfoFormCard';
import useUser from 'hooks/useUser';
import { phoneMask } from 'utils/masks';

// ----------------------------------------------------------------------

type AdvisorGeneralProps = {
  isEdit: boolean;
  currentAdvisor?: AdvisorManager;
  advisorId: string;
};

export default function AdvisorGeneral({ isEdit, currentAdvisor, advisorId }: AdvisorGeneralProps) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const clients = useSelector((state) => state.clients) as ClientsState;
  const clientsArray = arrayFromObj(clients.byId, clients.allIds).filter(
    (client) => !client.isProspect && client.advisorId === advisorId
  ) as ClientManager[];
  const clientsTotalAUM = getTotalAumFromCLients(clientsArray);
  const { user } = useUser();

  const [selectedTab, setSelectedTab] = useState('details');

  const defaultAvatarPath = getImagePath({
    userType: currentAdvisor?.isFirmAdmin
      ? (roles.FIRM_ADMIN as UserRole.FIRM_ADMIN)
      : (roles.ADVISOR as UserRole.ADVISOR),
    userId: advisorId,
    imageType: 'avatar',
  });
  const [avatarPath, setAvatarPath] = useState(defaultAvatarPath);
  const { url: avatarUrl } = useStorage({ path: avatarPath });
  const dispatch = useDispatch();

  const NewAdvisorSchema = Yup.object().shape({
    name: Yup.string().when('dummy', {
      is: () => isEdit === true,
      then: Yup.string().required('Name is required'),
    }),
    email: Yup.string().required('Email is required').email(),
    phoneNumber: Yup.string(),
    managementFees: Yup.object().shape({
      details: Yup.string(),
      timing: Yup.string(),
      valuation: Yup.string(),
      frequency: Yup.string(),
    }),
  });

  const initialValues = useMemo(
    () => ({
      name: currentAdvisor?.name || '',
      email: currentAdvisor?.email || '',
      crd: currentAdvisor?.crd || '',
      masterAccountNumber: currentAdvisor?.masterAccountNumber || '',
      status: currentAdvisor?.status === statuses.INACTIVE ? false : true,
      isVerified: currentAdvisor?.isVerified || true,
      phoneNumber: maskPhoneNumber(currentAdvisor?.phoneNumber || ''),
      socialMedia: {
        facebook: currentAdvisor?.socialMedia?.facebook ?? '',
        instagram: currentAdvisor?.socialMedia?.instagram ?? '',
        linkedin: currentAdvisor?.socialMedia?.linkedin ?? '',
        twitter: currentAdvisor?.socialMedia?.twitter ?? '',
        youtube: currentAdvisor?.socialMedia?.youtube ?? '',
      },
      managementFees: {
        details: currentAdvisor?.managementFees?.details ?? '',
        timing: currentAdvisor?.managementFees?.timing ?? '',
        valuation: currentAdvisor?.managementFees?.valuation ?? '',
        frequency: currentAdvisor?.managementFees?.frequency ?? '',
      },
    }),
    [currentAdvisor]
  );

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(NewAdvisorSchema),
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

  const isCurrentUser = user?.id === advisorId;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const newAdvisor = {
        ...data,
        phoneNumber: unmaskPhoneNumber(data.phoneNumber || ''),
        status: data.status
          ? (statuses.ACTIVE as UserStatus.ACTIVE)
          : (statuses.INACTIVE as UserStatus.INACTIVE),
      };
      if (!isEdit) {
        const response = await createAdvisor(newAdvisor);
        if (response?.id) {
          navigate(`${PATH_DASHBOARD.advisors.root}/${response.id}`);
        } else {
          enqueueSnackbar('Something went wrong!', { variant: 'error' });
        }
      } else {
        await updateAdvisor(advisorId, newAdvisor);
      }
      enqueueSnackbar(!isEdit ? 'Advisor was created!' : 'Advisor was updated!', {
        variant: 'success',
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || '';
      enqueueSnackbar(`Something went wrong${errorMessage ? `: ${errorMessage}` : ''}`, {
        variant: 'error',
      });
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
            const newUrl = await getStorageItem({ path: path, isPublic: true });
            dispatch(setUrl({ path: path, url: newUrl }));
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
            userType: currentAdvisor?.isFirmAdmin
              ? (roles.FIRM_ADMIN as UserRole.FIRM_ADMIN)
              : (roles.ADVISOR as UserRole.ADVISOR),
            userId: advisorId,
            imageType: fieldId,
          }) || '',
          file
        );
      }
    },
    [advisorId, currentAdvisor?.isFirmAdmin, defaultAvatarPath, dispatch, enqueueSnackbar]
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
        <Grid item xs={12}>
          {currentAdvisor?.isFirmAdmin && (
            <Alert severity="info">
              <Typography>
                You can edit firm admin details by visiting their profile{' '}
                <Typography component={Link} to={`/firm-admins/${advisorId}`}>
                  here.
                </Typography>
              </Typography>
            </Alert>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <ProfileFollowInfo totalClients={clientsArray.length} totalAUM={clientsTotalAUM} />
          </Stack>
          <Card sx={{ py: 10, pb: 3, px: 3 }}>
            {isEdit && (
              <Label
                color={watch('status') ? 'error' : 'success'}
                sx={{ textTransform: 'uppercase', position: 'absolute', top: 24, right: 24 }}
              >
                {watch('status') ? 'Active' : 'Inactive'}
              </Label>
            )}

            {advisorId && (
              <Box sx={{ mb: 5 }}>
                <UploadAvatarWrapper
                  handleDropSingleFile={handleDropSingleFile}
                  handleDeleteSingleFile={handleDeleteSingleFile}
                  avatarUrl={avatarUrl}
                  avatarPath={avatarPath}
                  hasTitle={false}
                />
              </Box>
            )}

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
                            ? "Toggling this off will disable the advisor's account."
                            : "Toggling this on will enable the advisor's account."}
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
                          ? 'The advisor has logged in to their dashboard.'
                          : 'The advisor has not logged in to their dashboard yet.'}
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                />

                {currentAdvisor?.createdAt && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 5,
                      mx: 'auto',
                      display: 'block',
                      color: 'text.secondary',
                    }}
                  >
                    Created {fDateTime(currentAdvisor.createdAt)}
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
                      fullWidth
                      disabled={isCurrentUser}
                      helperText={
                        isCurrentUser
                          ? 'You can not change your email here! Visit change email section in your profile.'
                          : ''
                      }
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
            <LoadingButton
              disabled={currentAdvisor?.isFirmAdmin}
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {!isEdit ? 'Create Advisor' : 'Save Changes'}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
