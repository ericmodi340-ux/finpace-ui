import { Button, Container } from '@mui/material';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
import Iconify from 'components/Iconify';
import Page from 'components/Page';
import { PATH_DASHBOARD } from 'routes/paths';
import FormsListView from 'sections/@dashboard/data-collection/views/forms-list-view';

export default function Forms() {
  return (
    <Page title={'Forms'}>
      <Container maxWidth="xl">
        <FormsListView />
      </Container>
    </Page>
  );
}
