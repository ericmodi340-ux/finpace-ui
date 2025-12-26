import { useState, ReactNode, useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  Dialog,
  Toolbar,
  Typography,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
// redux
import { useSelector } from 'redux/store';
// hooks
import useAuth from 'hooks/useAuth';
import useUser from 'hooks/useUser';
// utils
import { hasActivePlan } from 'utils/firm';
import getEnv from 'utils/getEnv';
// constants
import { envs, envUrls } from 'constants/envs';
import { roles, statuses } from 'constants/users';
import { useRouter } from 'routes/use-router';
import { useSearchParams } from 'react-router-dom';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { loading, isAuthenticated, logout } = useAuth();
  const { authUser, user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [checked, setChecked] = useState(false);
  const { firm } = useSelector((state) => state.firm);
  const [params] = useSearchParams();
  const env = getEnv();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout', { variant: 'error' });
    }
  };

  const check = useCallback(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      const returnTo = window.location.pathname;
      const searchParams = new URLSearchParams({
        returnTo,
      }).toString();

      let href = `/auth/login`;
      if (returnTo !== '/') {
        href += `?${searchParams}`;
      }

      if (params.get('userInfo')) {
        href += `&userInfo=${params.get('userInfo')}`;
      }

      router.replace(href);
    } else {
      setChecked(true);
    }
  }, [loading, isAuthenticated, params, router]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (!checked) {
    return null;
  }

  if (
    user?.status === statuses.INACTIVE ||
    (env === envs.PROD && firm.isVerified && !hasActivePlan(firm))
  ) {
    return (
      <Dialog fullScreen open>
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
            <Box>
              <Alert severity="error" sx={{ width: 'auto' }} data-test="inactive-alert">
                <AlertTitle>Account Inactive</AlertTitle>
                Your{!hasActivePlan(firm) ? " firm's" : ''} Finpace account is inactive. Please
                contact your firm admin to gain access.
              </Alert>

              {!hasActivePlan(firm) &&
                [roles.ADVISOR, roles.FIRM_ADMIN].includes(authUser?.role) && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      href={`${envUrls.STAGING}${window.location.pathname}${window.location.search}`}
                      title="Go to your Finpace dashboard"
                      size="large"
                      variant="contained"
                      sx={{ mt: 5, mx: 'auto', textTransform: 'none' }}
                    >
                      Go to sandbox
                    </Button>

                    {/* TODO: [DEV-401] Add Stripe customer portal link if stripeBillingManager */}
                  </Box>
                )}
            </Box>
          </Container>
        </RootStyle>
      </Dialog>
    );
  }

  return <>{children}</>;
}
