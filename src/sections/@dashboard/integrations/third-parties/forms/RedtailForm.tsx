import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { Form, FormikProvider, useFormik } from 'formik';
import { sentenceCase } from 'change-case';
// @mui
import { Box, Stack, Alert, AlertTitle, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { IntegrationServiceId } from '../../../../../@types/integration';
// redux
import { useSelector } from 'redux/store';
import { createFirmIntegration } from 'redux/slices/integrationsFirm';
import { createAdvisorIntegration } from 'redux/slices/integrationsAdvisor';
// components
import DeleteIntegrationButton from 'components/DeleteIntegrationButton';
// hooks
import useEditingIntegrations from 'hooks/useEditingIntegrations';
import useUser from 'hooks/useUser';
// constants
import { serviceIds } from 'constants/integrations';
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
}

// ----------------------------------------------------------------------

export default function RedtailForm(props: Props) {
  const { successEvent } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();

  const { firm } = useSelector((state) => state.firm);
  const { type, integrations } = useEditingIntegrations();
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.REDTAIL
  );

  const initialValues: any = {
    username: '',
    password: '',
  };

  const RedtailSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: RedtailSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        const newIntegration = {
          integrationType: serviceIds.REDTAIL,
          ...values,
        };
        if (type === 'firm') {
          await createFirmIntegration(firm.id, newIntegration);
        }
        if (type === roles.ADVISOR) {
          await createAdvisorIntegration(user?.id || '', newIntegration);
        }
        enqueueSnackbar('Configuration saved!', { variant: 'success' });
        setSubmitting(false);
        resetForm();
        successEvent();
      } catch (error) {
        setSubmitting(false);
        enqueueSnackbar(sentenceCase(error.response?.data.error || '') || 'Something went wrong', {
          variant: 'error',
        });
      }
    },
  });

  const { touched, errors, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {existingIntegration ? (
            <>
              <Box>
                <Alert severity="success" sx={{ width: 'auto' }}>
                  <AlertTitle>Your account is connected!</AlertTitle>
                  Looks like the Redtail integration is all set. Please be sure to map your fields
                  in the CRM Field Mapper and we'll take it from there!
                </Alert>
              </Box>
              <DeleteIntegrationButton
                id={serviceIds.REDTAIL as IntegrationServiceId}
                successEvent={successEvent}
              />
            </>
          ) : (
            <Stack direction={{ xs: 'column' }} spacing={{ xs: 3 }}>
              <TextField
                fullWidth
                label="Username"
                placeholder="thetestfirm"
                {...getFieldProps('username')}
                error={Boolean(touched.username && errors.username)}
                helperText={touched.username && errors.username}
              />
              <TextField
                fullWidth
                label="Password"
                placeholder="password123"
                {...getFieldProps('password')}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
              />

              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Connect with Redtail
              </LoadingButton>
            </Stack>
          )}
        </Stack>
      </Form>
    </FormikProvider>
  );
}
