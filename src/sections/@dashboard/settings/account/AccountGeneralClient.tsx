import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { sentenceCase } from 'change-case';
// @mui
import { Box, Grid, Card, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { ClientInvestorFields, ClientManager } from '../../../../@types/client';
import { UserRole } from '../../../../@types/user';
// components
import Tip from 'components/Tip';
// redux
import { updateClient } from 'redux/slices/clients';
import { createStorageItem, deleteStorageItem } from 'redux/slices/storage';
import * as Yup from 'yup';
import { updateUserSuccess } from 'redux/slices/user';
import { dispatch, useSelector } from 'redux/store';
// hooks
import useUser from 'hooks/useUser';
import useStorageAvatar from 'hooks/useStorageAvatar';
// utils
import { getImagePath } from 'utils/storage';
// constants
import { roles } from 'constants/users';
// config
import UploadAvatarWrapper from '../../../../components/upload/UploadAvatarWrapper';
import { validateMime } from 'utils/files';
import { cloneDeep, isEmpty, isEqual, omitBy } from 'lodash';
import clientInitialFormValues from 'sections/@dashboard/client/profile/utils/clientFormInitialValues';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InvestorSchema } from 'sections/@dashboard/client/profile/utils/clientSchema';
import FormProvider from 'components/hook-form/FormProvider';
import ClientInfoFormCard from 'sections/@dashboard/client/profile/ClientInfoFormCard';
import { mapFieldsToClient } from 'sections/@dashboard/client/profile/utils';
import { getCustomFieldFormScheme } from 'utils/custom-fields';

// ----------------------------------------------------------------------

export default function AccountGeneralClient() {
  const { enqueueSnackbar } = useSnackbar();
  const { authUser, user: dbUser } = useUser();
  const userId = authUser?.sub;
  const user = dbUser as ClientManager;

  const { firm } = useSelector((state) => state.firm);

  const defaultAvatarPath = getImagePath({
    userType: roles.CLIENT as UserRole.CLIENT,
    userId,
    imageType: 'avatar',
  });
  const [avatarPath, setAvatarPath] = useState(defaultAvatarPath);
  const { avatarUrl } = useStorageAvatar({ path: avatarPath });

  const initialValues = {
    ...cloneDeep(clientInitialFormValues),
    ...user,
  };

  const NewSchema = useMemo(() => {
    const fieldsArray = Object.values(firm?.clientFields?.fields || {});
    const onlyVisibleFieldsArray = [
      ...firm?.clientFields?.groups?.flatMap((group) =>
        group.isHidden || (authUser?.role === roles.CLIENT && group.hideFromClient)
          ? []
          : group?.fields || []
      ),
    ];

    const filteredFieldsArray = fieldsArray?.filter((field) =>
      onlyVisibleFieldsArray?.includes(field.key)
    );

    return InvestorSchema.concat(
      Yup.object().shape({
        custom: Yup.object().shape({
          ...filteredFieldsArray?.reduce(
            (acc, field) => ({ ...acc, ...getCustomFieldFormScheme(field, true) }),
            {}
          ),
        }),
      })
    );
  }, [authUser?.role, firm?.clientFields?.fields, firm?.clientFields?.groups]);

  const methods = useForm<Partial<ClientInvestorFields>>({
    resolver: yupResolver(NewSchema) as any,
    // @ts-ignore
    defaultValues: {
      ...NewSchema.cast(initialValues, {
        stripUnknown: true,
        assert: false,
      }),
      // @ts-ignore
      custom: NewSchema.fields.custom.cast(initialValues?.custom || {}),
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    if (user) {
      reset({
        ...cloneDeep(clientInitialFormValues),
        ...user,
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: Partial<ClientManager>) => {
    try {
      const userUpdated = mapFieldsToClient(values);

      // @ts-ignore
      const changedFields = omitBy(userUpdated, (v, k) => isEqual(v, user?.[k]));

      if (!isEmpty(values.custom)) {
        changedFields.custom = {
          ...user?.custom,
          ...values.custom,
        };
      }

      const response = await updateClient(userId, {
        ...changedFields,
      });
      reset(response);
      enqueueSnackbar('Update success', { variant: 'success' });
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const updateAvatarImage = (url: string) => {
    const updateUser = {
      id: userId,
      avatarUrl: url,
    };
    dispatch(updateUserSuccess({ role: authUser?.role, updateUser }));
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
            userType: roles.CLIENT as UserRole.CLIENT,
            userId: userId,
            imageType: fieldId,
          }) || '',
          file
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, defaultAvatarPath, enqueueSnackbar]
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
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ClientInfoFormCard clientId={userId} />
        </Grid>
        <Grid item xs={12} md={4}>
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
                    <li>in client lists and your profile page in advisor dashboards</li>
                    <li>in client lists and your profile page in firm admin dashboards</li>
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
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Save Changes
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
