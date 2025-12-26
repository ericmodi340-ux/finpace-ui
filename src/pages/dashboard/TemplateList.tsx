// @mui
import { Card, Container, Button } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { TemplateListTable, TemplateImportButton } from '../../sections/@dashboard/template/list';
import TemplateCreateModal from '../../sections/@dashboard/data-collection/template-create-modal';
// hooks
import { useBoolean } from '../../hooks/useBoolean';

// ----------------------------------------------------------------------

export default function TemplateList() {
  const createModal = useBoolean();

  const title = `My Templates`;

  return (
    <Page title={title}>
      <Container maxWidth="lg">
        <HeaderBreadcrumbs
          heading={title}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'My Templates', href: PATH_DASHBOARD.templates.root },
            { name: 'List' },
          ]}
          action={
            <>
              <TemplateImportButton />
              <Button
                variant="contained"
                startIcon={<Iconify icon={'eva:plus-fill'} />}
                onClick={createModal.onTrue}
                sx={{ ml: 1, mt: 2 }}
              >
                New Template
              </Button>
            </>
          }
        />

        <Card>
          <TemplateListTable />
        </Card>

        <TemplateCreateModal open={createModal.value} onClose={createModal.onFalse} />
      </Container>
    </Page>
  );
}
