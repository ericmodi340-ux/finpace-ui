import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { Navigate, useSearchParams } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
// components
import FormProvider, { RHFTextField } from 'components/hook-form';
import AmplifyVerifyView from './amplify-verify-view';
import { Button, Divider } from '@mui/material';

// ----------------------------------------------------------------------

export default function AmplifyLoginView({ email = '' }: { email: string }) {
  const [user, setUser] = useState<any>();
  const { login, isAuthenticated } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = {
    email: email || '',
  };

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      const user = await login(data.email);
      setUser(user);
    } catch (error: any) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  if (isAuthenticated) {
    return <Navigate to={returnTo || '/'} />;
  }

  if (user) {
    return <AmplifyVerifyView user={user} />;
  }

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in to your account</Typography>

      {/* <Typography>
        <Typography component="span" variant="body2">
          Don't have an account?{' '}
        </Typography>

        <Link component={RouterLink} to={`/auth/register?returnTo=${returnTo}`} variant="subtitle2">
          Get started
        </Link>
      </Typography> */}
    </Stack>
  );

  const renderForm = (
    <Stack
      spacing={3}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSubmit();
        }
      }}
    >
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="email" type="email" label="Email address" />

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}

      <Divider
        sx={{
          my: 5,
        }}
      />

      <Stack spacing={1}>
        <Typography component="span" variant="body2">
          Are you an Advisor? Not on Finpace?
        </Typography>

        <Button
          sx={{
            mx: 'auto',
          }}
          href="https://www.finpace.com/"
          variant="outlined"
        >
          Use Finpace Now
        </Button>
      </Stack>
    </FormProvider>
  );
}
