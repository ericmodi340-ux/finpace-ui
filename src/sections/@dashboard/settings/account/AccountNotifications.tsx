import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import { cloneDeep } from 'lodash';
// @mui
import { Card, Switch, Stack, Typography, FormControlLabel, Grid, Button } from '@mui/material';
// @types
import { AdvisorManager } from '../../../../@types/advisor';
import { ClientManager } from '../../../../@types/client';
import { FirmAdminManager } from '../../../../@types/firmAdmin';
import { NotificationType } from '../../../../@types/notification';
import { UserEmailSettings } from '../../../../@types/user';
// redux
import { updateFirmAdmin } from 'redux/slices/firmAdmins';
import { updateClient } from 'redux/slices/clients';
import { updateAdvisor } from 'redux/slices/advisor';
// hooks
import useUser from 'hooks/useUser';
// constants
import { notificationTypes } from 'constants/notifications';
import { roles } from 'constants/users';
import { useDispatch } from 'redux/store';
import { updateUserSuccess } from 'redux/slices/user';
import { LoadingButton } from '@mui/lab';

// ----------------------------------------------------------------------

const EMAILS_OPTIONS = [
  {
    value: notificationTypes.ENVELOPE_CREATED as NotificationType,
    label: 'when a document is created',
  },
  {
    value: notificationTypes.SIGNER_SIGNED as NotificationType,
    label: 'when a document is signed',
  },
  {
    value: notificationTypes.ENVELOPE_COMPLETED as NotificationType,
    label: 'when a document is completed',
  },
  {
    value: notificationTypes.ENVELOPE_DECLINED as NotificationType,
    label: 'when a document is declined',
  },
  {
    value: notificationTypes.ENVELOPE_CANCELLED as NotificationType,
    label: 'when a document has been cancelled',
  },
  {
    value: notificationTypes.FORM_ASSIGNED as NotificationType,
    label: 'when a form has been sent for review',
  },
  {
    value: notificationTypes.FORM_COMPLETED as NotificationType,
    label: 'when a form has been completed (all reviewers have reviewed)',
  },
  {
    value: notificationTypes.FORM_CANCELLED as NotificationType,
    label: 'when a form has been cancelled',
  },
] as const;

export const DEFAULT_NOTIFICATION_EMAIL_SETTINGS = {
  ENVELOPE_CANCELLED: false,
  ENVELOPE_COMPLETED: false,
  ENVELOPE_CREATED: false,
  ENVELOPE_DECLINED: false,
  FORM_CANCELLED: false,
  FORM_COMPLETED: false,
  FORM_ASSIGNED: true,
  SIGNER_SIGNED: false,
};

const NOTIFICATION_SETTINGS = (
  user: Partial<AdvisorManager | ClientManager | FirmAdminManager | null>
) => {
  let emailOn: Partial<UserEmailSettings> = cloneDeep(user?.settings?.emailOn) || {};
  Object.keys(notificationTypes).forEach((notificationType) => {
    const type = notificationType as NotificationType;
    emailOn[type] = emailOn[type] != null ? emailOn[type] : false;
  });

  return {
    emailOn,
  };
};

// ----------------------------------------------------------------------

export default function AccountNotifications() {
  const { enqueueSnackbar } = useSnackbar();
  const { authUser, user } = useUser();
  const userId = authUser?.sub;
  const dispatch = useDispatch();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      ...NOTIFICATION_SETTINGS(user),
    },
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setSubmitting(true);
        const newUser = {
          settings: {
            ...(user?.settings || {}),
            emailOn: {
              ...(user?.settings?.emailOn || {}),
              ...values.emailOn,
            },
          },
        };
        let resp: any;
        if (authUser?.role === roles.FIRM_ADMIN) {
          resp = await updateFirmAdmin(userId, newUser);
        } else if (authUser?.role === roles.CLIENT) {
          resp = await updateClient(userId, newUser);
        } else if (authUser?.role === roles.ADVISOR) {
          resp = await updateAdvisor(userId, newUser);
        }
        if (user?.id === resp?.id) {
          dispatch(updateUserSuccess({ role: authUser?.role, updateUser: resp }));
        }
        setSubmitting(false);
        enqueueSnackbar('Update success', { variant: 'success' });
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
        setSubmitting(false);
        setErrors(error);
      }
    },
  });

  const { values, handleSubmit, getFieldProps, setFieldValue, submitForm } = formik;

  return (
    <FormikProvider value={formik}>
      <Card sx={{ p: 3 }}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3} alignItems="flex-end">
            <Stack spacing={2} sx={{ width: 1 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Emails
              </Typography>
              <Grid container spacing={1}>
                {EMAILS_OPTIONS.map((option) => (
                  <Grid key={option.value} item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          {...getFieldProps(option.value)}
                          checked={values.emailOn[option.value]}
                          onChange={(e) => {
                            setFieldValue('emailOn.' + option.value, e.target.checked);
                          }}
                        />
                      }
                      label={`Email me ${option.label}`}
                      sx={{ mx: 0 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Stack>
        </Form>
      </Card>
      <Stack
        sx={{
          alignItems: 'center',
        }}
      >
        <LoadingButton
          sx={{
            ml: 'auto',
            mt: 3,
          }}
          onClick={submitForm}
          type="submit"
          variant="contained"
          loading={formik.isSubmitting}
        >
          Save Changes
        </LoadingButton>
      </Stack>
    </FormikProvider>
  );
}
