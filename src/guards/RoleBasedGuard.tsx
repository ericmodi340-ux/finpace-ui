import { ReactNode } from 'react';
import { Container, Alert, AlertTitle, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
// hooks
import useAuth from 'hooks/useAuth';
// routes
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

type RoleBasedGuardProp = {
  accessibleRoles: string[];
  children: ReactNode | string;
};

const useCurrentRole = () => {
  const { user } = useAuth();
  return user?.role || '';
};

export default function RoleBasedGuard({ accessibleRoles, children }: RoleBasedGuardProp) {
  const currentRole = useCurrentRole();

  if (!accessibleRoles.includes(currentRole)) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>Permission Denied</AlertTitle>
          You do not have permission to access this page
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
