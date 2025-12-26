// @mui
import { Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { IntegrationServiceId } from '../../../../../@types/integration';
// hooks
import useEditingIntegrations from 'hooks/useEditingIntegrations';
import useUser from 'hooks/useUser';
// components
import DeleteIntegrationButton from 'components/DeleteIntegrationButton';
// constants
import { serviceIds } from 'constants/integrations';
import { useCallback } from 'react';

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
}

// ----------------------------------------------------------------------

const isDev =
  window.location.hostname === 'localhost' || window.location.hostname === 'dev.finpace.app';

const clientId = isDev
  ? '2y8x9xBJWn09igWjRWhNXMLa7nL6UEsgLOWTAM5nfhU'
  : 'jqNVUvsFVtGi31RaX243Bkp4IPWPYifP7a67uI07c7o';

const API_BASE_FULL_URL = isDev
  ? 'https://dev.finpace.app/dev/api'
  : 'https://finpace.app/prod/api';

export default function WealthboxForm(props: Props) {
  const { successEvent } = props;
  const { user } = useUser();
  const { type, integrations } = useEditingIntegrations();
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.WEALTHBOX
  );
  const handleClick = useCallback(() => {
    const state = btoa(`${user?.firmId}:${user?.id}:${type}`);
    window.location.href = `https://app.crmworkspace.com/oauth/authorize?client_id=${clientId}&redirect_uri=${API_BASE_FULL_URL}/oauth/callback/wealthbox&response_type=code&scope=login+data&state=${state}`;
  }, [type, user?.firmId, user?.id]);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column' }} spacing={{ xs: 3 }}>
        {existingIntegration ? (
          <DeleteIntegrationButton
            id={serviceIds.WEALTHBOX as IntegrationServiceId}
            successEvent={successEvent}
          />
        ) : (
          <LoadingButton type="submit" variant="contained" onClick={handleClick}>
            Connect
          </LoadingButton>
        )}
      </Stack>
    </Stack>
  );
}
