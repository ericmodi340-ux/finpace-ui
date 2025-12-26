import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Card, Button, Container, Tab, Tabs } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import AutomationListTable from 'sections/@dashboard/automation/AutomationListTable';
import { useState } from 'react';
import ScheduleListTable from 'sections/@dashboard/automation/ScheduleListTable';

// ----------------------------------------------------------------------

export default function AutomationList() {
  const { themeStretch } = useSettings();

  const [tab, setTab] = useState('automations');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  return (
    <Page title={'Automations'}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={'Automation Hub'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Automation Hub', href: PATH_DASHBOARD.automation.root },
          ]}
        />

        <Card>
          <Tabs
            sx={{
              mx: 3,
            }}
            value={tab}
            onChange={handleTabChange}
          >
            <Tab value="automations" label="Execution History" />
            <Tab value="sc-automations" label="Scheduled Jobs" />
          </Tabs>
          {tab === 'sc-automations' && <ScheduleListTable />}
          {tab === 'automations' && <AutomationListTable />}
        </Card>
      </Container>
    </Page>
  );
}
