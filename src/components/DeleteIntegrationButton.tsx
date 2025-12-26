import { useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { IntegrationServiceId } from '../@types/integration';
// redux
import { deleteAdvisorIntegration } from 'redux/slices/integrationsAdvisor';
import { deleteFirmIntegration } from 'redux/slices/integrationsFirm';
// components
import Iconify from 'components/Iconify';
// hooks
import useEditingIntegrations from 'hooks/useEditingIntegrations';
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUser from 'hooks/useUser';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

interface Props {
  [key: string]: any;
  id: IntegrationServiceId;
  text?: string;
  successEvent?: () => void;
}

export default function DeleteIntegrationButton({
  id,
  text = 'Remove integration',
  successEvent,
  ...other
}: Props) {
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();
  const { type } = useEditingIntegrations();

  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteIntegration = async () => {
    try {
      setIsLoading(true);
      if (type === roles.ADVISOR) {
        await deleteAdvisorIntegration(user?.id || '', id);
      }
      if (type === 'firm') {
        await deleteFirmIntegration(user?.firmId || '', id);
      }
      enqueueSnackbar('Integration removed!', { variant: 'success' });
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      successEvent && successEvent();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <LoadingButton
        color="error"
        startIcon={<Iconify icon={'eva:trash-2-outline'} />}
        onClick={handleOpenDeleteConfirm}
        {...other}
        sx={{
          textTransform: 'none',
          ...(other.sx || {}),
        }}
      >
        {text}
      </LoadingButton>

      <Dialog open={deleteConfirmOpen} maxWidth="xs">
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>This will permanently delete the configuration for this integration.</strong>
            <br />
            <br />
            In order to use this service in the future, you will have to reconfigure settings for
            it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isLoading}
            onClick={handleCloseDeleteConfirm}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <LoadingButton
            color="error"
            variant="contained"
            disabled={isLoading}
            loading={isLoading}
            onClick={handleDeleteIntegration}
            sx={{ textTransform: 'none' }}
          >
            Yes, remove integration
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
