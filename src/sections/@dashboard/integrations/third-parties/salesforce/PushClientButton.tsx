import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { sentenceCase } from 'change-case';
// @mui
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { ClientManager } from '../../../../../@types/client';
import { IntegrationServiceId, IntegrationOwner } from '../../../../../@types/integration';
// components
import Label from 'components/Label';
// redux
import { pushClientToIntegration } from 'redux/slices/clients';
// utils
import { getIntegrationLastPushedAt } from 'utils/clients';
import { fDateTime } from 'utils/formatTime';
// constants
import { serviceIds } from 'constants/integrations';

type Props = {
  client: ClientManager;
  integrationOwner: IntegrationOwner | undefined;
  showIntegrationOwner?: boolean;
};

export default function SalesforcePushClientButton({
  client,
  integrationOwner,
  showIntegrationOwner = false,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!integrationOwner) {
    return <></>;
  }

  const lastPushedAt = getIntegrationLastPushedAt(
    client,
    serviceIds.SALESFORCE as IntegrationServiceId.SALESFORCE,
    integrationOwner
  );
  const clientHasUpdates =
    lastPushedAt && client.updatedAt && new Date(lastPushedAt) < new Date(client.updatedAt);

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handlePush = async () => {
    try {
      setIsLoading(true);
      await pushClientToIntegration({
        integrationType: serviceIds.SALESFORCE as IntegrationServiceId.SALESFORCE,
        integrationOwner,
        client,
      });
      handleCloseConfirm();
      enqueueSnackbar('Client pushed to Salesforce!', { variant: 'success' });
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(sentenceCase(error.response?.data.error || '') || 'Something went wrong', {
        variant: 'error',
      });
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        p: 1,
      }}
    >
      <LoadingButton
        onClick={handleOpenConfirm}
        variant="contained"
        sx={{ mb: 2, alignSelf: 'center', minWidth: '70%' }}
      >
        Push Client to Salesforce{showIntegrationOwner && ` (${sentenceCase(integrationOwner)})`}
      </LoadingButton>

      {clientHasUpdates && (
        <Tooltip title="The client has new changes since they were last pushed to Salesforce">
          <span style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <Label color="info" sx={{ mx: 1 }}>
              New Changes
            </Label>
          </span>
        </Tooltip>
      )}

      {lastPushedAt && (
        <Typography variant="caption" sx={{ fontStyle: 'italic', mx: 'auto', textAlign: 'center' }}>
          Last pushed at {fDateTime(lastPushedAt)}
        </Typography>
      )}

      <Dialog open={confirmOpen} maxWidth="xs">
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will update this client in Salesforce, or create a new contact in Salesforce if one
            does not exist yet.{' '}
            <strong>
              All conflicting details for this client in Salesforce will be overwritten by the
              values in Finpace.
            </strong>
            <br />
            <br />
            This process is not reversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={isLoading} onClick={handleCloseConfirm} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <LoadingButton
            color="primary"
            variant="contained"
            disabled={isLoading}
            loading={isLoading}
            onClick={handlePush}
            sx={{ textTransform: 'none' }}
          >
            Yes, push client
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
