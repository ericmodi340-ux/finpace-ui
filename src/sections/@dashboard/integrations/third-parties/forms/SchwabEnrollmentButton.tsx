import { useCallback } from 'react';
// @mui
import { Stack, Button } from '@mui/material';

import useEditingIntegrations from 'hooks/useEditingIntegrations';
import useUser from 'hooks/useUser';
import { serviceIds } from 'constants/integrations';
import DeleteIntegrationButton from 'components/DeleteIntegrationButton';
import { IntegrationServiceId } from '../../../../../@types/integration';
// utils

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
}

// ----------------------------------------------------------------------

const isDev =
  window.location.hostname === 'localhost' || window.location.hostname === 'dev.finpace.app';

const clientId = isDev ? 'YDMFGwwAdLh7Ah1qeUN9iBEnA8oXTbr9' : '7LLzI1tACUzvYeGbnHhniLxodmOf5RoG';

const API_BASE_FULL_URL = isDev ? 'https://dev.api.finpace.app' : 'https://api.finpace.app';

const baseUrl = isDev ? 'https://sandbox.schwabapi.com' : 'https://api.schwabapi.com';

export default function SchwabEnrollmentButton(props: Props) {
  const { user } = useUser();
  const { successEvent } = props;
  const { type, integrations } = useEditingIntegrations();

  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.SCHWAB
  );

  const handleClick = useCallback(() => {
    const state = btoa(`${user?.firmId}:${user?.id}:${type}`);
    window.location.href = `${baseUrl}/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${API_BASE_FULL_URL}/oauth/callback/schwab&response_type=code&state=${state}`;
  }, [type, user?.firmId, user?.id]);

  return (
    <Stack spacing={3}>
      {existingIntegration ? (
        <DeleteIntegrationButton
          id={serviceIds.SCHWAB as IntegrationServiceId}
          successEvent={successEvent}
        />
      ) : (
        <Button type="submit" variant="contained" onClick={() => handleClick()}>
          Connect with Schwab
        </Button>
      )}
    </Stack>
  );
}
