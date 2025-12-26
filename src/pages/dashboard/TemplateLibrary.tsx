// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// constants
import TemplateLibraryList from 'sections/@dashboard/template/list/TemplateLibraryList';

// ----------------------------------------------------------------------

export default function TemplateLibrary() {
  const { themeStretch } = useSettings();
  const title = `Templates Library`;
  return (
    <Page title={title}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={title}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Templates Library', href: PATH_DASHBOARD.library.root },
            { name: 'Templates' },
          ]}
        />
        <TemplateLibraryList />
      </Container>
    </Page>
  );
}
