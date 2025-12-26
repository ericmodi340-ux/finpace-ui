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
import { findAllClientFromIntegrationByEmail, pushClientToIntegration } from 'redux/slices/clients';
// utils
import { getIntegrationLastPushedAt } from 'utils/clients';
import { fDateTime } from 'utils/formatTime';
// constants
import { serviceIds } from 'constants/integrations';
import SelectClientDialog from '../SelectClientModal';

type Props = {
  client: ClientManager;
  integrationOwner: IntegrationOwner | undefined;
  showIntegrationOwner?: boolean;
};

export default function RedtailPushClientButton({
  client,
  integrationOwner,
  showIntegrationOwner = false,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingClientList, setIsFetchingClientList] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [clientList, setClientList] = useState<any>([]);

  if (!integrationOwner) {
    return <></>;
  }

  const lastPushedAt = getIntegrationLastPushedAt(
    client,
    serviceIds.REDTAIL as IntegrationServiceId.REDTAIL,
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

  const fetchClientList = async () => {
    try {
      setIsFetchingClientList(true);
      const response = await findAllClientFromIntegrationByEmail({
        integrationType: serviceIds.REDTAIL as IntegrationServiceId.REDTAIL,
        email: client.email,
        integrationOwner,
      }).finally(() => setIsFetchingClientList(false));
      if (!response.length || response.length === 1) {
        if (!response.length) {
          await handlePush();
          return;
        }
        await handlePush(response[0].id);
        return;
      }
      setClientList(response);
      setListOpen(true);
      handleCloseConfirm();
      return;
    } catch (err) {
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  };

  const handlePush = async (contactId?: string) => {
    try {
      setIsLoading(true);
      await pushClientToIntegration({
        integrationType: serviceIds.REDTAIL as IntegrationServiceId.REDTAIL,
        integrationOwner,
        client,
        queryParams: contactId ? { contactId } : {},
      });
      handleCloseConfirm();
      enqueueSnackbar('Client pushed to Redtail!', { variant: 'success' });
      setIsLoading(false);
      return;
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(sentenceCase(error?.response?.data.error || '') || 'Something went wrong', {
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
        Push Client to Redtail{showIntegrationOwner && ` (${sentenceCase(integrationOwner)})`}
      </LoadingButton>

      {clientHasUpdates && (
        <Tooltip title="The client has new changes since they were last pushed to Redtail">
          <span style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <Label color="info" sx={{ mx: 'auto' }}>
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
            This will update this client in Redtail, or create a new contact in Redtail if one does
            not exist yet.{' '}
            <strong>
              All conflicting details for this client in Redtail will be overwritten by the values
              in Finpace.
            </strong>
            <br />
            <br />
            This process is not reversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isLoading || isFetchingClientList}
            onClick={handleCloseConfirm}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <LoadingButton
            color="primary"
            variant="contained"
            disabled={isLoading || isFetchingClientList}
            loading={isLoading || isFetchingClientList}
            onClick={fetchClientList}
            sx={{ textTransform: 'none' }}
          >
            Yes, push client
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <SelectClientDialog
        onSelect={handlePush}
        open={listOpen}
        isLoading={isLoading}
        clientList={clientList}
        onClose={() => setListOpen(false)}
      />
    </Box>
  );
}
