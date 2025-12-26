import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sentenceCase } from 'change-case';
// @mui
import { styled } from '@mui/material/styles';
import {
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Toolbar,
  Box,
  Typography,
  Button,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import useUser from 'hooks/useUser';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { NewClientStepper } from 'sections/@dashboard/client/new-client-stepper';
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export default function ClientCreate({ isProspect = false }: { isProspect?: boolean }) {
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const { authUser } = useUser();

  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [clientWasCreated, setClientWasCreated] = useState(false);

  const clientType = isProspect ? 'prospect' : 'client';
  const listPage = PATH_DASHBOARD.clients.root;

  const handleClose = () => {
    if (authUser?.role === roles.CLIENT) {
      navigate(PATH_DASHBOARD.clients.root);
    } else {
      navigate(-1);
    }
  };

  const handleCancel = () => {
    setCancelConfirmOpen(true);
  };

  const handleCloseCancelConfirm = () => {
    setCancelConfirmOpen(false);
  };

  return (
    <Page title={`Create a new ${clientType}`}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={`Create a new ${clientType}`}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: sentenceCase(`${clientType}s`), href: listPage },
            { name: `New ${clientType}` },
          ]}
        />

        <Dialog
          fullScreen
          open
          PaperProps={{
            sx: {
              backgroundColor: (theme) => theme.palette.background.neutral,
            },
          }}
        >
          <NewClientStepper
            handleClose={handleClose}
            setClientWasCreated={setClientWasCreated}
            isProspect={isProspect}
          />
        </Dialog>
      </Container>

      <Dialog open={cancelConfirmOpen} maxWidth="xs">
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {clientWasCreated
              ? `Canceling now will save changes on any steps that have been completed. The ${clientType} will appear in your ${clientType}s list.`
              : `You will lose any changes that have been entered. No ${clientType} has been created.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelConfirm} sx={{ textTransform: 'none' }}>
            No, go back
          </Button>
          <Button variant="contained" onClick={handleClose} sx={{ textTransform: 'none' }}>
            Yes, cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
}
