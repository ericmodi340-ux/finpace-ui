// @mui
import { Stack, TextField, Tooltip, InputAdornment, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { IntegrationServiceId } from '../../../../../@types/integration';
import useUser from 'hooks/useUser';
// constants
import { serviceIds } from 'constants/integrations';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAdvisorIntegration,
  updateAdvisorIntegration,
} from 'redux/slices/integrationsAdvisor';
import Iconify from 'components/Iconify';
import { useBoolean } from 'hooks/useBoolean';
import useIntegrations from 'hooks/useIntegrations';
import { useSnackbar } from 'notistack';
import FidelitySsoButton from '../fidelity/FidelitySsoButton';
import { UserRole } from '../../../../../@types/user';

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
}

// ----------------------------------------------------------------------

export default function FidelityForm(props: Props) {
  const [id, setId] = useState('');
  const editable = useBoolean(false);
  const { user } = useUser();
  const { integrations, loading } = useIntegrations();
  const { enqueueSnackbar } = useSnackbar();

  const integration = useMemo(
    () => integrations.find((integration) => integration.id === serviceIds.FIDELITY),
    [integrations]
  );

  useEffect(() => {
    if (integration) {
      setId(integration?.fidelityId);
    }
  }, [integration, integrations]);

  const onSaveId = useCallback(async () => {
    try {
      if (integration) {
        await updateAdvisorIntegration(
          user?.id || '',
          serviceIds.FIDELITY as IntegrationServiceId.FIDELITY,
          {
            fidelityId: id,
          }
        );
        enqueueSnackbar('Integration updated!', { variant: 'success' });
        editable.onFalse();
      } else {
        await createAdvisorIntegration(user?.id || '', {
          integrationType: serviceIds.FIDELITY as IntegrationServiceId.FIDELITY,
          fidelityId: id,
        });
        enqueueSnackbar('Integration updated!', { variant: 'success' });
        editable.onFalse();
      }
    } catch (err) {
      console.log(err);
    }
  }, [editable, enqueueSnackbar, id, integration, user?.id]);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column' }} spacing={{ xs: 3 }}>
        <TextField
          fullWidth
          label="Fidelity ID"
          placeholder="7690012732"
          value={id}
          disabled={!editable.value}
          InputProps={{
            endAdornment: !editable.value && (
              <InputAdornment position="end">
                <Tooltip title="Edit ">
                  <IconButton onClick={() => editable.onTrue()}>
                    <Iconify icon="mdi:edit-outline" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          onChange={(e) => setId(e.target.value)}
        />

        {integration && !editable.value && (
          <FidelitySsoButton
            advisor={{
              ...user,
              fidelityId: id,
            }}
            integrationOwner={integration?.integrationOwner as UserRole.ADVISOR}
          />
        )}

        {editable.value && (
          <LoadingButton variant="contained" loading={loading} onClick={onSaveId}>
            Save
          </LoadingButton>
        )}
      </Stack>
    </Stack>
  );
}
