import { useState, Fragment } from 'react';
import { useSnackbar } from 'notistack';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Divider, Typography, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// redux
import { useSelector } from 'redux/store';
import { updateFirm } from 'redux/slices/firm';
import { updateFirmAdmin } from 'redux/slices/firmAdmins';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUser from 'hooks/useUser';
// components
import Iconify from 'components/Iconify';
// constants
import { roles } from 'constants/users';
import useAppTour from 'hooks/useAppTour';
//routes
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

const STEPS = [
  {
    title: 'Tell your team',
    description: 'Be sure to invite your advisors and firm admins.',
    icon: 'eva:people-fill',
    linkTo: PATH_DASHBOARD.settings.firm + '?t=team',
  },
  {
    title: 'Integrate with your services',
    description: 'Configure the tools you use to keep everything in sync.',
    icon: 'eva:link-2-fill',
    linkTo: PATH_DASHBOARD.general.integrations,
  },
  {
    title: 'Create a form template',
    description: 'Set up a form template to onboard your first client.',
    icon: 'eva:file-text-fill',
    linkTo: PATH_DASHBOARD.templates,
  },
];

// ----------------------------------------------------------------------

export default function NextSteps({ onContinue }: { onContinue: VoidFunction }) {
  const theme = useTheme();
  const { authUser, user } = useUser();
  const { id: firmId } = useSelector((state) => state.firm.firm);
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();

  // Consume useState from app tour context
  const { setOpenAppTour: setTourApp } = useAppTour();

  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    try {
      setSubmitting(true);

      const newFirm = {
        isVerified: true,
      };

      // ? The firm admin that created the firm will have their name already set from Cognito
      if (authUser?.role === roles.FIRM_ADMIN && user?.name) {
        try {
          const newFirmAdmin = {
            isVerified: true,
          };
          await updateFirmAdmin(authUser?.sub, newFirmAdmin);
          await updateFirm(firmId, newFirm);
          enqueueSnackbar('Onboarding was successful!', { variant: 'success' });
          setTourApp(true);
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
      } else {
        await updateFirm(firmId, newFirm);
        enqueueSnackbar('Onboarding was successful!', { variant: 'success' });
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
      <Box
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
                    minWidth: '200px',
                    p: 3,
                  }}
                  to={step.linkTo as string}
                  component={RouterLink}
                  onClick={handleFinish}
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
      </Box>

      <Box
        sx={{
          flex: 1,
          maxWidth: 480,
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '30px 0',
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
