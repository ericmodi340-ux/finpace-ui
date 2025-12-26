import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Dialog, Container, Toolbar, Typography, Box, Button } from '@mui/material';
// @types
import { UserRole } from '../../@types/user';
// components
import LoadingScreen from 'components/LoadingScreen';
// sections
import { FirmOnboardingStepper, FirmAdminOnboardingStepper, AdvisorOnboardingStepper } from '.';
// redux
import { useSelector } from 'redux/store';
// hooks
import useAuth from 'hooks/useAuth';
import useUser from 'hooks/useUser';
// constants
import { roles } from 'constants/users';
import AppTour from 'components/AppTour';
import useAppTour from 'hooks/useAppTour';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export default function OnboardingModal() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { authUser, user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const { firm } = useSelector((state) => state.firm);

  // Consume useState from app tour context
  const { openAppTour: tourApp } = useAppTour();

  const [open, setOpen] = useState<
    'firm' | UserRole.FIRM_ADMIN | UserRole.ADVISOR | UserRole.CLIENT | ''
  >('');

  useEffect(() => {
    let openOnboardingFor: 'firm' | UserRole.FIRM_ADMIN | UserRole.ADVISOR | UserRole.CLIENT | '' =
      '';

    if (firm.id && !firm.isVerified && authUser?.role === roles.FIRM_ADMIN) {
      openOnboardingFor = 'firm';
    } else if (user?.id && !user?.isVerified && authUser?.role !== roles.CLIENT) {
      openOnboardingFor = authUser?.role;
    }

    setOpen(openOnboardingFor);
  }, [firm, authUser, user]);

  if (!isAuthenticated) {
    return <></>;
  }

  if (!firm.id) {
    return <LoadingScreen />;
  }

  const handleClose = () => {
    setOpen('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
      window.location.reload();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout', { variant: 'error' });
    }
  };

  return (
    <>
      <Dialog fullScreen open={Boolean(open)} data-test="onboarding-modal">
        <RootStyle>
          <Toolbar sx={{ flex: 0, mt: 2, mb: 2 }}>
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography sx={{ color: 'text.disabled' }} variant="body2" component="div">
                Logged in as:
              </Typography>
              <Typography variant="subtitle1" component="div">
                {user?.email}
              </Typography>
            </Box>

            <Box sx={{ ml: 2, flex: 0 }}>
              <Typography variant="subtitle1" component="div">
                <Button
                  onClick={handleLogout}
                  sx={{
                    color: 'text.disabled',
                    typography: 'body2',
                    py: 1,
                    px: 2,
                    borderRadius: 1,
                    m: 1,
                  }}
                  data-test="sign-out-button"
                >
                  Logout
                </Button>
              </Typography>
            </Box>
          </Toolbar>
          <Container
            sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {open === 'firm' && <FirmOnboardingStepper handleClose={handleClose} />}
            {open === roles.FIRM_ADMIN && <FirmAdminOnboardingStepper handleClose={handleClose} />}
            {open === roles.ADVISOR && <AdvisorOnboardingStepper handleClose={handleClose} />}
          </Container>
        </RootStyle>
      </Dialog>
      {tourApp && <AppTour />}
    </>
  );
}
