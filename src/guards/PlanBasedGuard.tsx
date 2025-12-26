import { ReactNode } from 'react';
import { Container, Alert, AlertTitle, Button, Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
// @types
import { FirmPlanId } from '../@types/firm';
// redux
import { useSelector } from 'redux/store';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// constants
import { emails } from 'constants/bitsy';

// ----------------------------------------------------------------------

type PlanBasedGuardProp = {
  accessiblePlans: FirmPlanId[];
  children: ReactNode | string;
};

export const useCurrentPlan = () => {
  const { firm } = useSelector((state) => state.firm);
  return firm?.plan?.planId;
};

export default function PlanBasedGuard({ accessiblePlans, children }: PlanBasedGuardProp) {
  const currentPlan = useCurrentPlan();

  if (!currentPlan || !accessiblePlans.includes(currentPlan)) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>Permission Denied</AlertTitle>
          Your plan does not include this feature! Please{' '}
          <Link href={`mailto:${emails.SALES}`}>contact Finpace</Link> to upgrade.
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
