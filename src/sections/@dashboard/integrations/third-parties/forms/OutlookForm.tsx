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
import { BACKEND_URL } from 'config';

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
}

// ----------------------------------------------------------------------

export default function OutlookForm(props: Props) {
  const { successEvent } = props;
  const { user } = useUser();
  const { type, integrations } = useEditingIntegrations();
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.OUTLOOK
  );
  const handleClick = useCallback(() => {
    const state = btoa(`${user?.firmId}:${user?.id}:${type}`);
    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=82387f2a-efdc-4e5c-b998-45ad1232cf2b&response_type=code&redirect_uri=${BACKEND_URL}/oauth/callback/outlook&response_mode=query&scope=https://graph.microsoft.com/Calendars.ReadWrite%20offline_access&state=${state}`;
    window.location.href = url;
  }, [type, user?.firmId, user?.id]);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column' }} spacing={{ xs: 3 }}>
        {existingIntegration ? (
          <DeleteIntegrationButton
            id={serviceIds.OUTLOOK as IntegrationServiceId}
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
