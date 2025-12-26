import { useNavigate } from 'react-router-dom';
import { sentenceCase } from 'change-case';
// @mui
import { styled } from '@mui/material/styles';
import { Container, Dialog } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import ImportClientStepper from 'sections/@dashboard/client/import-client-stepper/ImportClientStepper';

// ----------------------------------------------------------------------

export default function ClientImport({ isProspect = false }: { isProspect?: boolean }) {
  const { themeStretch } = useSettings();
  const navigate = useNavigate();

  const clientType = isProspect ? 'prospect' : 'client';
  const listPage = PATH_DASHBOARD.clients.root;

  const handleClose = () => {
    navigate(PATH_DASHBOARD.clients.root);
  };

  return (
    <Page title={`Import a new ${clientType}`}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={`Import a new ${clientType}`}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: sentenceCase(`${clientType}s`), href: listPage },
            { name: `New ${clientType}` },
          ]}
        />

        <Dialog
          fullScreen
          PaperProps={{
            sx: {
              backgroundColor: (theme) => theme.palette.background.neutral,
            },
          }}
          open
        >
          <ImportClientStepper handleClose={handleClose} isProspect={isProspect} />
        </Dialog>
      </Container>
    </Page>
  );
}
