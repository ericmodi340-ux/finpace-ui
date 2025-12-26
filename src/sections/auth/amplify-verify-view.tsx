import * as Yup from 'yup';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// hooks
import { useCountdownSeconds } from 'hooks/use-countdown';
// components
import FormProvider, { RHFCodes } from 'components/hook-form';
import useAuth from 'hooks/useAuth';

// ----------------------------------------------------------------------

export default function AmplifyVerifyView({ user }: { user: any }) {
  const { verifyOtp, login } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const { countdown, counting, startCountdown } = useCountdownSeconds(60);
  const [amplifyUser, setAmplifyUser] = useState<any>(user);

  const VerifySchemaSchema = Yup.object().shape({
    code: Yup.string().min(6, 'Code must be at least 6 characters').required('Code is required'),
  });

  const defaultValues = {
    code: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifySchemaSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await verifyOtp(amplifyUser, data.code);
    } catch (error) {
      console.error(error);
      setAmplifyUser(error.user);
      setErrorMsg(error.message);
    }
  });

  const handleResendCode = useCallback(async () => {
    try {
      reset();
      setErrorMsg('');
      startCountdown();
      const user = await login(amplifyUser.username);
      setAmplifyUser(user);
    } catch (error) {
      console.error(error);
    }
  }, [login, startCountdown, amplifyUser, reset]);

  const renderForm = (
    <Stack
      spacing={3}
      alignItems="center"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSubmit();
        }
      }}
    >
      <RHFCodes
        TextFieldsProps={{
          type: 'number',
        }}
        name="code"
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Verify
      </LoadingButton>

      <Typography variant="body2">
        {`Don't have a code? `}
        <Link
          variant="subtitle2"
          onClick={handleResendCode}
          sx={{
            cursor: 'pointer',
            ...(counting && {
              color: 'text.disabled',
              pointerEvents: 'none',
            }),
          }}
        >
          Resend code {counting && `(${countdown}s)`}
        </Link>
      </Typography>
    </Stack>
  );

  const renderHead = (
    <>
      <Stack spacing={1} sx={{ mb: 5 }}>
        <Typography variant="h3">
          Please check <br /> your email!
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          We have emailed a 6-digit confirmation code to {amplifyUser?.username}, please enter the
          code in below box to verify your email.
        </Typography>

        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      </Stack>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
