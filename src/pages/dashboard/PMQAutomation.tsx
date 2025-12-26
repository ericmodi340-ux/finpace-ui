import { styled } from '@mui/material/styles';
import { Dialog } from '@mui/material';
import PMQAutomation from 'sections/@dashboard/automation/views/pmq-automation';
import { ReactFlowProvider } from 'reactflow';
import { useRouter } from 'routes/use-router';
import { PATH_DASHBOARD } from 'routes/paths';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
}));

// ----------------------------------------------------------------------

export default function PMQAutomationPage() {
  const navigate = useRouter();

  return (
    <Dialog fullScreen open>
      <ReactFlowProvider>
        <RootStyle>
          <PMQAutomation onClose={() => navigate.push(PATH_DASHBOARD.automation.new)} />
        </RootStyle>
      </ReactFlowProvider>
    </Dialog>
  );
}
