// @mui
import { Box, Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import AutomationCard from 'sections/@dashboard/automation/AutomationCard';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

export default function CreateAutomations() {
  const navigate = useNavigate();
  const title = `Create Automation`;
  return (
    <Page title={title}>
      <Container>
        <HeaderBreadcrumbs
          heading={title}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Automations', href: PATH_DASHBOARD.automation.root },
            { name: 'Create' },
          ]}
        />
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          <AutomationCard
            name="Import Clients"
            type="Firm"
            onClick={() => {
              navigate(PATH_DASHBOARD.automation.importClient);
            }}
            icon="fa6-solid:file-import"
          />
          <AutomationCard
            name="PMQ"
            type="Firm"
            onClick={() => {
              navigate(PATH_DASHBOARD.automation.pmq);
            }}
            icon="fa6-solid:file-import"
          />
        </Box>
      </Container>
    </Page>
  );
}
