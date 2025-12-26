import { useSnackbar } from 'notistack';
import { Form, FormikProvider, useFormik } from 'formik';
// @mui
import { Box, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { FirmManager } from '../../../../../@types/firm';
import { AdvisorManager } from '../../../../../@types/advisor';
// redux
import { useSelector } from 'redux/store';
import { updateFirm } from 'redux/slices/firm';
import { updateAdvisor } from 'redux/slices/advisor';
// hooks
import useUser from 'hooks/useUser';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
}

// ----------------------------------------------------------------------

export default function CalendarForm(props: Props) {
  const { successEvent } = props;
  const { firm } = useSelector((state) => state.firm);
  const { advisor } = useSelector((state) => state.advisor);
  const { enqueueSnackbar } = useSnackbar();
  const { authUser } = useUser();

  let editingSettings = authUser?.role === roles.ADVISOR ? advisor : firm;

  const initialValues: any = {
    url: editingSettings?.settings?.calendar?.url || '',
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        if (authUser?.role === roles.FIRM_ADMIN) {
          await updateSettingsFirm(values);
        }
        if (authUser?.role === roles.ADVISOR) {
          await updateSettingsAdvisor(values);
        }
        enqueueSnackbar('Configuration successfully saved', { variant: 'success' });
        setSubmitting(false);
        resetForm();
        successEvent();
      } catch (error) {
        setSubmitting(false);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    },
  });

  const updateSettingsFirm = async (values: any) => {
    const newFirmSettings: Partial<FirmManager> = {
      settings: {
        ...(firm.settings || {}),
        calendar: {
          ...(firm.settings?.calendar || {}),
          url: values.url,
        },
      },
    };
    await updateFirm(firm.id, newFirmSettings);
  };

  const updateSettingsAdvisor = async (values: any) => {
    const newAdvisorSettings: Partial<AdvisorManager> = {
      settings: {
        ...(advisor?.settings || {}),
        calendar: {
          ...(advisor?.settings?.calendar || {}),
          url: values.url,
        },
      },
    };
    await updateAdvisor(advisor?.id || '', newAdvisorSettings);
  };

  const { handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Enter your meeting link from Calendly, Acuity, Chili Piper, or any other scheduling
            service below.
            <br />
            This will show on branded login pages and in client profiles.
          </Typography>
          <Box>
            <TextField
              fullWidth
              label="Calendar Meeting URL"
              placeholder="e.g. https://calendly.com/YOURLINK"
              {...getFieldProps('url')}
            />
          </Box>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Connect
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
