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

const DEFAULT_FIELD_MAPPING = {
  firstName: 'contact.Firstname',
  middleInitial: 'contact.Middlename',
  lastName: 'contact.Lastname',
  email: 'internets.Address',
  phoneNumber: 'phones.Number',
  address: 'addresses.Address1',
  city: 'addresses.City',
  state: 'addresses.State',
  zipCode: 'addresses.Zip',
  ssn: 'contact.TaxID',
};

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
  isAdvisorTab: boolean;
}

// ----------------------------------------------------------------------

export default function LaserAppForm({ successEvent, isAdvisorTab }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { user, authUser } = useUser();

  const { firm } = useSelector((state) => state.firm);
  const { type, integrations } = useEditingIntegrations();
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.LASERAPP
  );

  const initialValues: any = {
    username: '',
    password: '',
    dHost: 'GWN Securities',
  };

  const LaserAppSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
    dHost: Yup.string().when('dummy', {
      is: () => authUser?.role === roles.ADVISOR || isAdvisorTab,
      then: Yup.string().required('Host is required'),
    }),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: LaserAppSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        const newIntegration = {
          integrationType: serviceIds.LASERAPP,
          ...values,
          fields: DEFAULT_FIELD_MAPPING,
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

  const fields = [
    { name: 'username', label: 'Username', type: 'text', visible: true },
    { name: 'password', label: 'Password', type: 'password', visible: true },
    {
      name: 'dHost',
      label: 'Host',
      type: 'text',
      visible: authUser?.role === roles.ADVISOR || isAdvisorTab,
    },
  ];

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {existingIntegration ? (
            <>
              <Box>
                <Alert severity="success" sx={{ width: 'auto' }}>
                  <AlertTitle>Your account is connected!</AlertTitle>
                  Looks like the LaserApp integration is all set. Please be sure to map your fields
                  in the CRM Field Mapper and we'll take it from there!
                </Alert>
              </Box>
              <DeleteIntegrationButton
                id={serviceIds.LASERAPP as IntegrationServiceId}
                successEvent={successEvent}
              />
            </>
          ) : (
            <Stack direction={{ xs: 'column' }} spacing={{ xs: 3 }}>
              {fields.map((field) => (
                <>
                  {field.visible && (
                    <TextField
                      key={field.name}
                      fullWidth
                      type={field.type}
                      label={field.label}
                      placeholder={field.label}
                      {...getFieldProps(field.name)}
                      error={Boolean(touched[field.name] && errors[field.name])}
                      helperText={touched[field.name] && errors[field.name]}
                    />
                  )}
                </>
              ))}

              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Connect with LaserApp
              </LoadingButton>
            </Stack>
          )}
        </Stack>
      </Form>
    </FormikProvider>
  );
}
