import { useState } from 'react';
import * as Yup from 'yup';
import { Auth, API } from 'aws-amplify';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider } from 'formik';
// @mui
import { Stack, Card, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import type { ObjectShape } from 'yup/lib/object';

// ----------------------------------------------------------------------

export default function AccountChangeEmail() {
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const [captureAccessCode, setCaptureAccessCode] = useState(false);

  const validationShape: ObjectShape = {
    email: Yup.string().required('New email is required'),
  };

  if (captureAccessCode) {
    validationShape.accessCode = Yup.string().required('Access Code is required');
  }

  const ChangeEmailSchema = Yup.object().shape(validationShape);

  const formik = useFormik({
    initialValues: {
      email: '',
      accessCode: '',
    },
    validationSchema: ChangeEmailSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const { email, accessCode } = values;
        const user = await Auth.currentAuthenticatedUser();

        if (!captureAccessCode) {
          await Auth.updateUserAttributes(user, {
            email: email,
          });
          setCaptureAccessCode(true);
          enqueueSnackbar('Access code successfully sent', { variant: 'success' });
        } else {
          await Auth.verifyUserAttributeSubmit(user, 'email', accessCode);
          await API.put('bitsybackendv2', `/email`, {
            body: { email },
          });
          enqueueSnackbar('Email change success', { variant: 'success' });
          setCaptureAccessCode(false);
        }

        if (isMountedRef.current) {
          if (captureAccessCode) {
            resetForm();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
          setSubmitting(false);
        }
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar(`Email change failed: ${error.message}`, { variant: 'error' });
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <Card sx={{ p: 3 }}>
      <FormikProvider value={formik}>
        <Form autoComplete="off" onSubmit={handleSubmit}>
          <Stack spacing={3} alignItems="flex-end">
            <TextField
              {...getFieldProps('email')}
              fullWidth
              autoComplete="on"
              type="email"
              label="New Email"
              disabled={captureAccessCode}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
            />

            {captureAccessCode && (
              <TextField
                {...getFieldProps('accessCode')}
                fullWidth
                autoComplete="on"
                type="text"
                label="Check your email for access code"
                error={Boolean(touched.accessCode && errors.accessCode)}
                helperText={touched.accessCode && errors.accessCode}
              />
            )}

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Save Changes
            </LoadingButton>
          </Stack>
        </Form>
      </FormikProvider>
    </Card>
  );
}
