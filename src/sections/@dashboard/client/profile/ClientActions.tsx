// @mui
import { Box, Grid, Card, CardHeader, Typography } from '@mui/material';
// @types
import { UserRole } from '../../../../@types/user';
// sections
import ClientIntegrationsActions from './ClientIntegrationsActions';
// components
import DeleteUserButton from 'components/DeleteUserButton';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

type ClientActionsProps = {
  clientId: string;
  isProspect: boolean;
};

export default function ClientActions({ clientId, isProspect = false }: ClientActionsProps) {
  const clientType = isProspect ? 'prospect' : 'client';

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography sx={{ mb: 2 }} variant="h6">
          Integrated Services
        </Typography>
        <ClientIntegrationsActions clientId={clientId} />
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title={`Permanently delete ${clientType}`} />
          <Box sx={{ p: 3 }}>
            <DeleteUserButton
              text={`Delete this ${clientType}`}
              type={roles.CLIENT as UserRole.CLIENT}
              id={clientId}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
