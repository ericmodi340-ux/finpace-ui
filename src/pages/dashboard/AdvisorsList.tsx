import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Card, Button, Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import AdvisorsListView from 'sections/@dashboard/advisor/view/advisor-list-view';

// ----------------------------------------------------------------------

export default function AdvisorsList() {
  const { themeStretch } = useSettings();

  return (
    <Page title="Advisors">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Advisors"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Advisors', href: PATH_DASHBOARD.advisors.root },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              component={RouterLink}
              to={PATH_DASHBOARD.advisors.new || ''}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              New Advisors
            </Button>
          }
        />

        <Card>
          <AdvisorsListView />
        </Card>
      </Container>
    </Page>
  );
}
