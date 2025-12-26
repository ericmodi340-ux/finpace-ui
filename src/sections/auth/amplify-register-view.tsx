import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link as RouterLink, Navigate, useSearchParams } from 'react-router-dom';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import FormProvider, { RHFTextField } from 'components/hook-form';
import useAuth from 'hooks/useAuth';
import AmplifyVerifyView from './amplify-verify-view';

// ----------------------------------------------------------------------

export default function AmplifyRegisterView() {
  const { register, login, isAuthenticated } = useAuth();
  const [user, setUser] = useState<any>();
  const [errorMsg, setErrorMsg] = useState('');

  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await register(data.email, data.firstName, data.lastName);
      const user = await login(data.email);
      setUser(user);
    } catch (error: any) {
      console.error(error);
      reset();
      setErrorMsg(
        typeof error === 'string'
          ? error
          : error.message.replace('PreSignUp failed with error ', '')
      );
    }
  });

  if (isAuthenticated) {
    return <Navigate to={returnTo || '/'} />;
  }

  if (user) {
    return <AmplifyVerifyView user={user} />;
  }

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4">Get started absolutely free</Typography>

      <Typography>
        <Typography component="span" variant="body2">
          Already have an account?{' '}
        </Typography>

        <Link to={`/auth/login?returnTo=${returnTo}`} component={RouterLink} variant="subtitle2">
          Sign in
        </Link>
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack
      spacing={2.5}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSubmit();
        }
      }}
    >
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField name="firstName" label="First name" />
        <RHFTextField name="lastName" label="Last name" />
      </Stack>

      <RHFTextField name="email" label="Email address" />

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Create account
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
