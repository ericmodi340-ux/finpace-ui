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

export default function SchwabPushClientButton({
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
    serviceIds.SCHWAB as IntegrationServiceId.SCHWAB,
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
        integrationType: serviceIds.SCHWAB as IntegrationServiceId.SCHWAB,
        integrationOwner,
        client,
      });
      handleCloseConfirm();
      enqueueSnackbar('Client pushed to Schwab!', { variant: 'success' });
      setIsLoading(false);
    } catch (error: any) {
      console.error(error);
      let errorMessage;
      if (typeof error?.response?.data.error === 'string') {
        errorMessage = error?.response?.data.error;
      } else if (error?.response?.data.error[0]?.detail) {
        errorMessage = error?.response?.data.error[0].detail;
      } else {
        errorMessage = 'Something went wrong';
      }

      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 8000,
      });
      setIsLoading(false);
    }
  };

  const clientMissingRequiredFields =
    !client.firstName ||
    !client.lastName ||
    !client?.addresses?.[0].address1 ||
    !client?.addresses?.[0].city ||
    !client?.addresses?.[0].state ||
    !client?.addresses?.[0].zipCode ||
    !client.email ||
    !client.phoneNumber;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        textAlign: 'center',
        p: 1,
      }}
    >
      <Tooltip
        title={
          Boolean(clientMissingRequiredFields)
            ? 'Client must have name, address, city, state, ZIP, email address, and phone number before pushing to Schwab.'
            : ''
        }
      >
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <LoadingButton
            onClick={handleOpenConfirm}
            disabled={clientMissingRequiredFields}
            variant="contained"
            sx={{ mb: 2, alignSelf: 'center', minWidth: '70%' }}
          >
            Push Client to Schwab{showIntegrationOwner && ` (${sentenceCase(integrationOwner)})`}
          </LoadingButton>
        </div>
      </Tooltip>

      {clientHasUpdates && (
        <Tooltip title="The client has new changes since they were last pushed to Schwab">
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <Label color="info" sx={{ mx: 'auto' }}>
              New Changes
            </Label>
          </div>
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
            This will update this client in Schwab, or create a new contact in Schwab if one does
            not exist yet.{' '}
            <strong>
              All conflicting details for this client in Schwab will be overwritten by the values in
              Finpace.
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
