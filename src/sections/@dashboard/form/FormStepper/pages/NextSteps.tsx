// @mui
import { Box, Button, Dialog, Stack } from '@mui/material';
// @types
import { FormManager } from '../../../../../@types/form';
// sections
// hooks
import useIntegrations from 'hooks/useIntegrations';
// constants
import useForm from 'hooks/useForm';
import { PATH_DASHBOARD } from 'routes/paths';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LaserAppList from 'sections/@dashboard/integrations/third-parties/laserapp/LaserAppList';
import useUser from 'hooks/useUser';
import { Container } from '@mui/material';
import { Card } from '@mui/material';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  currentForm: FormManager;
  formId?: string;
  handleClose: () => void;
};

export default function NextSteps({ currentForm, formId, handleClose }: Props) {
  const formFromStore = useForm(formId);
  const { user } = useUser();
  const isLaserappEnabled =
    user?.email === 'aa@gmail.com' ||
    user?.email === 'mzacka@gwnsecurities.com' ||
    user?.email === 'cneitzel@gwnsecurities.com';
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const { integrations } = useIntegrations();
  const includesLaserApp = integrations.some((integration) => integration.id.includes('laserapp'));

  const formIsReady = formFromStore?.status === 'completed';

  const showLaserAppButton = includesLaserApp && formIsReady;

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };
  const handleDialogOpen = () => {
    setConfirmOpen(true);
  };

  const handleReload = () => {
    navigate(`${PATH_DASHBOARD.forms.new}?clientId=${currentForm.clientId}`);
    window.location.reload();
  };

  return (
    <MContainer>
      {showLaserAppButton && (
        <Stack
          direction="column"
          sx={{
            mb: 2,
          }}
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          {isLaserappEnabled && (
            <Button
              variant="contained"
              size="large"
              onClick={handleDialogOpen}
              sx={{ width: '277px' }}
            >
              Send To LaserApp
            </Button>
          )}

          <Button variant="contained" size="large" onClick={handleReload} sx={{ width: '277px' }}>
            Create another account
          </Button>
        </Stack>
      )}
      <Button variant="contained" size="large" onClick={handleClose} sx={{ width: '277px' }}>
        Sounds good!
      </Button>
      <Dialog open={confirmOpen} fullWidth>
        <LaserAppList handleCloseConfirm={handleCloseConfirm} currentForm={currentForm} />
      </Dialog>
    </MContainer>
  );
}

const MContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: { xs: '100%', md: 600 },
      mx: 'auto',
      my: {
        xs: 'auto',
        md: 10,
      },
      minHeight: '210px',
    }}
  >
    <Container maxWidth="sm">
      <Card
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Card>
    </Container>
  </Box>
);
