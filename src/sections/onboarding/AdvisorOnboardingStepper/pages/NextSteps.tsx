import { useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { updateAdvisor } from 'redux/slices/advisors';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUser from 'hooks/useUser';
import { useDispatch } from 'redux/store';
import { updateUserSuccess } from 'redux/slices/user';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function NextSteps({ onContinue }: { onContinue: VoidFunction }) {
  const theme = useTheme();
  const { authUser } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const dispatch = useDispatch();

  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    try {
      setSubmitting(true);
      const newAdvisor = {
        isVerified: true,
      };
      const resp = await updateAdvisor(authUser?.sub, newAdvisor);
      if (resp?.id === authUser?.sub) {
        dispatch(updateUserSuccess({ role: authUser?.role, updateUser: resp }));
      }
      enqueueSnackbar('Onboarding was successful!', { variant: 'success' });
      if (isMountedRef.current) {
        onContinue();
        setSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  return (
    <Box
      sx={{
        width: `calc(100vw - ${theme.spacing(3)} * 2)`,
        position: 'relative',
        left: `calc(-50vw + ${theme.spacing(3)} + 50%)`,
        mt: 3,
        mb: 3,
      }}
    >
      {/* <Box
        sx={{
          maxWidth: '840px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <Grid
          container
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1.5,
            textAlign: 'left',
          }}
        >
          {STEPS.map((step, idx) => (
            <Fragment key={idx}>
              <Grid item xs>
                <Button
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    p: 3,
                  }}
                  onClick={handleFinish}
                  to={step.linkTo as string}
                  component={RouterLink}
                  disabled={step.linkTo === undefined}
                >
                  <Iconify
                    icon={step.icon}
                    width={24}
                    height={24}
                    sx={{ mb: 1, color: 'text.secondary', mr: 'auto' }}
                  />
                  <Typography sx={{ color: 'text.primary', fontWeight: 'bold', mb: 1, mr: 'auto' }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{step.description}</Typography>
                </Button>
              </Grid>
              {idx < STEPS.length - 1 && <Divider orientation="vertical" flexItem />}
            </Fragment>
          ))}
        </Grid>
      </Box> */}

      <Box
        sx={{
          flex: 1,
          maxWidth: 480,
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Box sx={{ py: 2, display: 'flex' }}>
          <LoadingButton
            variant="contained"
            size="large"
            disabled={submitting}
            loading={submitting}
            onClick={handleFinish}
            sx={{ flex: 1 }}
            data-test="onboarding-continue-button"
          >
            Let's Go!
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
}
