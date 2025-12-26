import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
import Iconify from 'components/Iconify';
// @mui
import {
  Grid,
  Card,
  Stack,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  InputAdornment,
  Box,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import {
  FirmManager,
  FirmSigningReminderSettings,
  FirmSigningReminderSetting,
  FirmProspectSetting,
} from '../../../../@types/firm';
// redux
import { useSelector } from 'redux/store';
import { updateFirm } from 'redux/slices/firm';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';

// ----------------------------------------------------------------------

const FIRM_SIGNING_REMINDER_FIELD_LABELS: { [key in FirmSigningReminderSetting]: string } = {
  enabled: 'Use custom settings',
  delay: 'How long should we wait before sending the first reminder email?',
  frequency: 'How often to send reminders?',
};

const FIRM_PROSPECTS_FIELD_LABELS: { [key in FirmProspectSetting]: string } = {
  clients: 'Clients Notifications',
  prospects: 'Prospects Notifications',
  sendDisclosureDocsOnClientAdd: 'Client Onboarding - Send Disclosure Documents',
};

// ----------------------------------------------------------------------

export default function FirmSigningReminders() {
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();

  const { firm } = useSelector((state) => state.firm);

  const DEFAULT_SIGNING_REMINDER_SETTINGS = {
    enabled: false,
    delay: 3,
    frequency: 3,
  };

  const DEFAULT_PROSPECTS_SETTINGS = true;
  const DEFAULT_CLIENTS_SETTINGS = true;
  const DEFAULT_SEND_DISCLOSURE_DOCS_ON_CLIENT_ADD_SETTINGS = true;

  const DEFAULT_EMAIL_SETTINGS = {
    disclosures: {
      subject: 'Disclosure Documents',
      body: `<p>Hi <mention>CLIENT_NAME</mention>,</p><p></p><p><mention>FIRM_NAME</mention> has sent disclosures for your review. Please see the files attached!</p><p></p><p>No further action is required on your part.</p>`,
    },
    prospects: DEFAULT_PROSPECTS_SETTINGS,
    clients: DEFAULT_CLIENTS_SETTINGS,
  };

  const SigningRemindersSchema = Yup.object().shape({
    delay: Yup.number().when('enabled', {
      is: true,
      then: Yup.number().required('Delay is required'),
    }),
    frequency: Yup.number().when('enabled', {
      is: true,
      then: Yup.number().required('Frequency is required'),
    }),
  });

  const signerReminderInitialValues: FirmSigningReminderSettings = {
    enabled: firm.settings?.signingReminders?.enabled || DEFAULT_SIGNING_REMINDER_SETTINGS.enabled,
    delay: firm.settings?.signingReminders?.delay || DEFAULT_SIGNING_REMINDER_SETTINGS.delay,
    frequency:
      firm.settings?.signingReminders?.frequency || DEFAULT_SIGNING_REMINDER_SETTINGS.frequency,
  };

  const prospectsInitialValues: boolean =
    firm.settings?.emails?.prospects ?? DEFAULT_PROSPECTS_SETTINGS;
  const clientsInitialValues: boolean = firm.settings?.emails?.clients ?? DEFAULT_CLIENTS_SETTINGS;
  const sendDisclosureDocsOnClientAddInitialValues: boolean =
    firm.settings?.sendDisclosureDocsOnClientAdd ??
    DEFAULT_SEND_DISCLOSURE_DOCS_ON_CLIENT_ADD_SETTINGS;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      ...signerReminderInitialValues,
      prospects: prospectsInitialValues,
      clients: clientsInitialValues,
      sendDisclosureDocsOnClientAdd: sendDisclosureDocsOnClientAddInitialValues,
    },
    validationSchema: SigningRemindersSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);

        let newSigningReminderSettings: FirmSigningReminderSettings = {
          ...(firm.settings?.signingReminders || DEFAULT_SIGNING_REMINDER_SETTINGS),
          delay: values.delay,
          enabled: values.enabled,
          frequency: values.frequency,
        };

        const newFirmSettings: Partial<FirmManager> = {
          settings: {
            ...(firm.settings || {}),
            signingReminders: newSigningReminderSettings,
            emails: {
              ...(firm.settings?.emails || DEFAULT_EMAIL_SETTINGS),
              prospects: values.prospects,
              clients: values.clients,
            },
            sendDisclosureDocsOnClientAdd: values.sendDisclosureDocsOnClientAdd,
          },
        };
        await updateFirm(firm.id, newFirmSettings);
        enqueueSnackbar('Signing reminder settings saved!', { variant: 'success' });
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      } catch (error) {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
  });

  const { values, errors, touched, isSubmitting, handleSubmit, getFieldProps, setFieldValue } =
    formik;

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3} alignItems="flex-end">
            <Stack spacing={2} sx={{ width: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  NOTIFICATIONS
                </Typography>
              </Box>
              <Stack spacing={1} alignItems="flex-start">
                <FormControlLabel
                  control={
                    <Switch
                      {...getFieldProps('prospects')}
                      checked={Boolean(values.prospects)}
                      onChange={(e) => {
                        setFieldValue('prospects', e.target.checked);
                      }}
                    />
                  }
                  label={FIRM_PROSPECTS_FIELD_LABELS['prospects' as FirmProspectSetting.PROSPECTS]}
                  sx={{ mx: 0 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      {...getFieldProps('clients')}
                      checked={Boolean(values.clients)}
                      onChange={(e) => {
                        setFieldValue('clients', e.target.checked);
                      }}
                    />
                  }
                  label={FIRM_PROSPECTS_FIELD_LABELS['clients' as FirmProspectSetting.CLIENTS]}
                  sx={{ mx: 0 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      {...getFieldProps('sendDisclosureDocsOnClientAdd')}
                      checked={Boolean(values.sendDisclosureDocsOnClientAdd)}
                      onChange={(e) => {
                        setFieldValue('sendDisclosureDocsOnClientAdd', e.target.checked);
                      }}
                    />
                  }
                  label={
                    FIRM_PROSPECTS_FIELD_LABELS[
                      'sendDisclosureDocsOnClientAdd' as FirmProspectSetting.SEND_DISCLOSURE_DOCS_ON_CLIENT_ADD
                    ]
                  }
                  sx={{ mx: 0 }}
                />
              </Stack>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Signing Reminders
                </Typography>
                <Tooltip
                  title="Reminder emails are sent out by DocuSign, hence its content cannot be customized"
                  placement="right"
                >
                  <Box sx={{ ml: 1, display: 'flex' }}>
                    <Iconify
                      color="primary.main"
                      icon={'ion:information-circle-sharp'}
                      width={21}
                      height={21}
                    />
                  </Box>
                </Tooltip>
              </Box>
              <Stack spacing={1} alignItems="flex-start">
                <FormControlLabel
                  control={
                    <Switch
                      {...getFieldProps('enabled')}
                      checked={Boolean(values.enabled)}
                      onChange={(e) => {
                        setFieldValue('enabled', e.target.checked);
                      }}
                    />
                  }
                  label={
                    FIRM_SIGNING_REMINDER_FIELD_LABELS[
                      'enabled' as FirmSigningReminderSetting.ENABLED
                    ]
                  }
                  sx={{ mx: 0 }}
                />

                {values.enabled && (
                  <>
                    {[
                      'delay' as FirmSigningReminderSetting.DELAY,
                      'frequency' as FirmSigningReminderSetting.FREQUENCY,
                    ].map((fieldId) => (
                      <Grid container sx={{ alignItems: 'center' }} key={fieldId}>
                        <Grid item xs={12} md={6} sx={{ p: 1 }}>
                          <label htmlFor={fieldId}>
                            {FIRM_SIGNING_REMINDER_FIELD_LABELS[fieldId]}
                          </label>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ p: 1 }}>
                          <TextField
                            {...getFieldProps(fieldId)}
                            hiddenLabel
                            value={values[fieldId]}
                            onChange={(event) =>
                              setFieldValue(
                                fieldId,
                                !event.target.value ? 0 : parseFloat(event.target.value)
                              )
                            }
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              sx: { textAlign: 'center' },
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">days</InputAdornment>,
                            }}
                            error={Boolean(touched[fieldId] && errors[fieldId])}
                            helperText={touched[fieldId] && errors[fieldId]}
                          />
                        </Grid>
                      </Grid>
                    ))}
                  </>
                )}
              </Stack>
            </Stack>

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Save Changes
            </LoadingButton>
          </Stack>
        </Form>
      </FormikProvider>
    </Card>
  );
}
