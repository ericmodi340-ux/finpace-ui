import { useState } from 'react';
import { sentenceCase } from 'change-case';
// @mui
import { Box, Dialog, Typography, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { ClientManager } from '../../../../../@types/client';
import { IntegrationServiceId, IntegrationOwner } from '../../../../../@types/integration';
// components
import Label from 'components/Label';
// redux
// utils
import { getIntegrationLastPushedAt } from 'utils/clients';
import { fDateTime } from 'utils/formatTime';
// constants
import { serviceIds } from 'constants/integrations';
import LaserAppList from './LaserAppList';

type Props = {
  client: ClientManager;
  integrationOwner: IntegrationOwner | undefined;
  showIntegrationOwner?: boolean;
};

export default function LaserAppPushClientButton({
  client,
  integrationOwner,
  showIntegrationOwner = false,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!integrationOwner) {
    return <></>;
  }

  const lastPushedAt = getIntegrationLastPushedAt(
    client,
    serviceIds.LASERAPP as IntegrationServiceId.LASERAPP,
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
        Push Client to LaserApp{showIntegrationOwner && ` (${sentenceCase(integrationOwner)})`}
      </LoadingButton>
      {clientHasUpdates && (
        <Tooltip title="The client has new changes since they were last pushed to LaserApp">
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

      <Dialog open={confirmOpen} fullWidth>
        <LaserAppList handleCloseConfirm={handleCloseConfirm} />
      </Dialog>
    </Box>
  );
}
