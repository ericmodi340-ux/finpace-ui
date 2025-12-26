import { styled } from '@mui/material/styles';
import { Dialog } from '@mui/material';
import ImportClientAutomation from 'sections/@dashboard/automation/views/import-client-automation';
import { useRouter } from 'routes/use-router';
import { PATH_DASHBOARD } from 'routes/paths';
import { ReactFlowProvider } from 'reactflow';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
}));

// ----------------------------------------------------------------------

export default function ImportClientAutomationPage() {
  const navigate = useRouter();
  const handleClose = () => {
    navigate.push(PATH_DASHBOARD.automation.root);
  };

  return (
    <Dialog fullScreen open>
      <ReactFlowProvider>
        <RootStyle>
          <ImportClientAutomation onClose={handleClose} />
        </RootStyle>
      </ReactFlowProvider>
    </Dialog>
  );
}
