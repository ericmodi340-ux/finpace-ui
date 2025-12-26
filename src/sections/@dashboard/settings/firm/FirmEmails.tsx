import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
// @mui
import { Card, Stack, Typography, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { FirmManager, FirmEmailSettings, FirmEmailType } from '../../../../@types/firm';
// redux
import { useSelector } from 'redux/store';
import { updateFirm } from 'redux/slices/firm';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
// utils
import { parseMentions, unparseMentions } from 'utils/mentions';

// ----------------------------------------------------------------------

export default function FirmEmails() {
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();

  const { firm } = useSelector((state) => state.firm);

  const DEFAULT_EMAIL_SETTINGS = {
    disclosures: {
      subject: 'Disclosure Documents',
      body: `<p>Hi <mention>CLIENT_NAME</mention>,</p><p></p><p><mention>FIRM_NAME</mention> has sent disclosures for your review. Please see the files attached!</p><p></p><p>No further action is required on your part.</p>`,
    },
    prospects: {
      invite: true,
    },
  };

  const initialValues: { [key: string]: string } = {
    disclosures__subject:
      firm.settings?.emails?.disclosures?.subject || DEFAULT_EMAIL_SETTINGS.disclosures.subject,
    disclosures__body: unparseMentions(
      `${firm.settings?.emails?.disclosures?.body || DEFAULT_EMAIL_SETTINGS.disclosures.body}`
    ),
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);

        let newEmailSettings: FirmEmailSettings = firm.settings?.emails || DEFAULT_EMAIL_SETTINGS;

        Object.keys(values).forEach((compositeName) => {
          const [emailType, fieldName] = compositeName.split('__');
          if (emailType && fieldName && values[compositeName] !== undefined) {
            newEmailSettings = {
              ...newEmailSettings,
              [emailType]: {
                ...(newEmailSettings[emailType as FirmEmailType] || {}),
                [fieldName]: parseMentions(values[compositeName]),
              },
            };
          }
        });

        const newFirmSettings: Partial<FirmManager> = {
          settings: {
            ...(firm.settings || {}),
            emails: newEmailSettings,
          },
        };
        await updateFirm(firm.id, newFirmSettings);
        enqueueSnackbar('Email settings saved!', { variant: 'success' });
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

  const { values, isSubmitting, handleSubmit, getFieldProps, setFieldValue } = formik;

  return (
    <Card sx={{ p: 3 }}>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3} alignItems="flex-end">
            <Stack spacing={2} sx={{ width: 1 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Disclosures
              </Typography>

              <Stack spacing={1} alignItems="flex-start">
                <TextField fullWidth label="Subject" {...getFieldProps('disclosures__subject')} />
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
