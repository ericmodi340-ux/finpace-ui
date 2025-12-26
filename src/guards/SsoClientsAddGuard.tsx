import { ReactNode } from 'react';
import { Container, Alert, AlertTitle, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
// redux
import { useSelector } from 'redux/store';
// routes
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

type SsoClientsAddGuardProp = {
  isProspect?: boolean;
  children: ReactNode | string;
};

export default function SsoClientsAddGuard({ isProspect, children }: SsoClientsAddGuardProp) {
  const { firm } = useSelector((state) => state.firm);

  if (firm?.ssoClientsOnly) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>Not Accessible</AlertTitle>
          Please initiate adding {isProspect ? 'prospects' : 'clients'} via SSO from your firm's
          dashboard
        </Alert>
        <Box sx={{ padding: '1rem 0rem', mt: 1 }}>
          <Button to={PATH_DASHBOARD.root} component={RouterLink} sx={{ textTransform: 'none' }}>
            {'<'} Go back to dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return <>{children}</>;
}
