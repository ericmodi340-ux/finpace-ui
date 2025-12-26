import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { Form, FormikProvider, useFormik } from 'formik';
// @mui
import { Stack, Typography, TextField, Switch, FormControlLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { IntegrationServiceId } from '../../../../../@types/integration';
// redux
import { useSelector } from 'redux/store';
import { createFirmIntegration, updateFirmIntegration } from 'redux/slices/integrationsFirm';
// components
import DeleteIntegrationButton from 'components/DeleteIntegrationButton';
// constants
import { serviceIds } from 'constants/integrations';

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
}

// ----------------------------------------------------------------------

export default function DocusignForm(props: Props) {
  const { successEvent } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { firm } = useSelector((state) => state.firm);
  const { integrations } = useSelector((state) => state.integrationsFirm);
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.DOCUSIGN
  );

  const initialValues: any = {
    useBitsyDocusignAccount:
      existingIntegration?.useBitsyDocusignAccount !== undefined
        ? existingIntegration?.useBitsyDocusignAccount
        : true,
    basePath: existingIntegration?.basePath || '',
    accountId: existingIntegration?.accountId || '',
    rsaKey: existingIntegration?.rsaKey || '',
    clientId: existingIntegration?.clientId || '',
    impersonatedUserGuid: existingIntegration?.impersonatedUserGuid || '',
    brandId: existingIntegration?.brandId || '',
    folderId: existingIntegration?.folderId || '',
  };

  const DocusignSchema = Yup.object().shape({
    basePath: Yup.string().when('useBitsyDocusignAccount', {
      is: false,
      then: Yup.string().required('Base Path is required'),
    }),
    accountId: Yup.string().when('useBitsyDocusignAccount', {
      is: false,
      then: Yup.string().required('Account ID is required'),
    }),
    rsaKey: Yup.string().when('useBitsyDocusignAccount', {
      is: false,
      then: Yup.string().required('RSA Key is required'),
    }),
    clientId: Yup.string().when('useBitsyDocusignAccount', {
      is: false,
      then: Yup.string().required('Client ID is required'),
    }),
    impersonatedUserGuid: Yup.string().when('useBitsyDocusignAccount', {
      is: false,
      then: Yup.string().required('Impersonated User GUID is required'),
    }),
    brandId: Yup.string().when('useBitsyDocusignAccount', {
      is: false,
      then: Yup.string().required('Brand ID is required'),
    }),
    folderId: Yup.string().when('useBitsyDocusignAccount', {
      is: false,
      then: Yup.string().required('Folder ID is required'),
    }),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: DocusignSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        if (existingIntegration) {
          const updateIntegration = {
            ...values,
          };
          await updateFirmIntegration(
            firm.id,
            serviceIds.DOCUSIGN as IntegrationServiceId,
            updateIntegration
          );
        } else {
          const newIntegration = {
            integrationType: serviceIds.DOCUSIGN,
            ...values,
          };
          await createFirmIntegration(firm.id, newIntegration);
        }
        enqueueSnackbar('Configuration saved!', { variant: 'success' });
        setSubmitting(false);
        resetForm();
        successEvent();
      } catch (error) {
        setSubmitting(false);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    },
  });

  const { values, touched, errors, handleSubmit, isSubmitting, getFieldProps, setFieldValue } =
    formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column' }} spacing={{ xs: 3 }}>
            <FormControlLabel
              labelPlacement="start"
              control={
                <Switch
                  onChange={(event) =>
                    setFieldValue('useBitsyDocusignAccount', event.target.checked)
                  }
                  checked={Boolean(values.useBitsyDocusignAccount)}
                />
              }
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Use Finpace DocuSign Account?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Toggling this off will allow you to use your own DocuSign account with Finpace
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            {!values.useBitsyDocusignAccount && (
              <>
                <TextField
                  fullWidth
                  label="Base Path"
                  placeholder="https://na4.docusign.net"
                  {...getFieldProps('basePath')}
                  error={Boolean(touched.basePath && errors.basePath)}
                  helperText={touched.basePath && errors.basePath}
                />
                <TextField
                  fullWidth
                  label="Account ID"
                  placeholder="0123ab45-c67d-89e0-f123-456g789012h3"
                  {...getFieldProps('accountId')}
                  error={Boolean(touched.accountId && errors.accountId)}
                  helperText={touched.accountId && errors.accountId}
                />
                <TextField
                  fullWidth
                  label="RSA Key"
                  placeholder="-----BEGIN RSA PRIVATE KEY-----\nABC123..."
                  {...getFieldProps('rsaKey')}
                  error={Boolean(touched.rsaKey && errors.rsaKey)}
                  helperText={touched.rsaKey && errors.rsaKey}
                />
                <TextField
                  fullWidth
                  label="Client ID"
                  placeholder="0123ab45-c67d-89e0-f123-456g789012h3"
                  {...getFieldProps('clientId')}
                  error={Boolean(touched.clientId && errors.clientId)}
                  helperText={touched.clientId && errors.clientId}
                />
                <TextField
                  fullWidth
                  label="Impersonated User ID"
                  placeholder="0123ab45-c67d-89e0-f123-456g789012h3"
                  {...getFieldProps('impersonatedUserGuid')}
                  error={Boolean(touched.impersonatedUserGuid && errors.impersonatedUserGuid)}
                  helperText={touched.impersonatedUserGuid && errors.impersonatedUserGuid}
                />
                <TextField
                  fullWidth
                  label="Brand ID"
                  placeholder="0123ab45-c67d-89e0-f123-456g789012h3"
                  {...getFieldProps('brandId')}
                  error={Boolean(touched.brandId && errors.brandId)}
                  helperText={touched.brandId && errors.brandId}
                />
                <TextField
                  fullWidth
                  label="Folder ID"
                  placeholder="0123ab45-c67d-89e0-f123-456g789012h3"
                  {...getFieldProps('folderId')}
                  error={Boolean(touched.folderId && errors.folderId)}
                  helperText={touched.folderId && errors.folderId}
                />
              </>
            )}

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {existingIntegration ? 'Update settings' : 'Connect'}
            </LoadingButton>

            {existingIntegration && (
              <DeleteIntegrationButton
                id={serviceIds.DOCUSIGN as IntegrationServiceId}
                successEvent={successEvent}
              />
            )}
          </Stack>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
