import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Dialog, Container, Toolbar, Typography, Box, Button, Stack } from '@mui/material';
// components
import LoadingScreen from 'components/LoadingScreen';
// redux
import { useSelector } from 'redux/store';
// hooks
import useAuth from 'hooks/useAuth';
import useUser from 'hooks/useUser';
import { useEffect, useState } from 'react';
import { emails } from 'constants/bitsy';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export default function ContactSalesModal() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const { firm } = useSelector((state) => state.firm);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (firm && firm.id && firm.onHold) {
      setOpen(true);
    }
  }, [firm]);

  if (!isAuthenticated) {
    return <></>;
  }

  if (!firm.id) {
    return <LoadingScreen />;
  }

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
      <Dialog fullScreen open={open} data-test="onboarding-modal">
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
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <Stack
              sx={{
                maxWidth: '760px',
                marginLeft: 'auto',
                marginRight: 'auto',
                alignItems: 'center',
              }}
            >
              <Typography variant="h3">Welcome Aboard!</Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                Thank you for signing up with us! We're thrilled to have you on board. To ensure you
                have a smooth and successful onboarding experience, we recommend reaching out to our
                dedicated sales team.{' '}
              </Typography>
              <Button sx={{ mt: 3 }} variant="contained" href={`mailto:${emails.SALES}`}>
                Contact Sales
              </Button>
            </Stack>
          </Container>
        </RootStyle>
      </Dialog>
    </>
  );
}
