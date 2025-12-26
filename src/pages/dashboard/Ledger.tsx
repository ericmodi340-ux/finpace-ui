// @mui
import { Container } from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
// sections
import ActivityLogsListView from 'sections/@dashboard/activity-logs/view/activity-logs-list-view';

// ----------------------------------------------------------------------

export default function LedgerPage() {
  const { themeStretch } = useSettings();

  return (
    <Page title="Ledger">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <ActivityLogsListView />
      </Container>
    </Page>
  );
}
