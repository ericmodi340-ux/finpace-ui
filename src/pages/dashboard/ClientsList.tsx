import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Card, Button, Container, Tooltip } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import useIntegrations from 'hooks/useIntegrations';
import ClientListView from 'sections/@dashboard/client/view/client-list-view';
import { Typography } from '@mui/material';
import { Stack } from '@mui/material';

// ----------------------------------------------------------------------

export default function ClientsList() {
  const { themeStretch } = useSettings();

  const { integrations } = useIntegrations();

  return (
    <Page title="Customers">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          alignItems="center"
          spacing={2}
          justifyContent="space-between"
        >
          <Typography variant="h4">Customers</Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              variant="outlined"
              sx={{ mr: 1, width: 200, textTransform: 'none' }}
              component={RouterLink}
              to={PATH_DASHBOARD.clients?.import}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              Import Customer(s)
            </Button>
            <Button
              variant="contained"
              sx={{ width: 200, textTransform: 'none' }}
              component={RouterLink}
              to={PATH_DASHBOARD.clients?.new || ''}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              New Customer
            </Button>
          </Stack>
        </Stack>

        <ClientListView />
      </Container>
    </Page>
  );
}
