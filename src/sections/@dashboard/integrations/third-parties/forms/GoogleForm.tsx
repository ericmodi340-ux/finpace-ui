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
import { API_BASE_FULL_URL } from 'config';

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
}

// ----------------------------------------------------------------------

export default function GoogleForm(props: Props) {
  const { successEvent } = props;
  const { user } = useUser();
  const { type, integrations } = useEditingIntegrations();
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.GOOGLE
  );
  const handleClick = useCallback(() => {
    const state = btoa(`${user?.firmId}:${user?.id}:${type}`);
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=496390817055-8s5ubca7b1llof8qfrrr1eh5f4s7e0aj.apps.googleusercontent.com&redirect_uri=${API_BASE_FULL_URL}/oauth/callback/google&response_type=code&scope=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent&state=${state}`;
    window.location.href = url;
  }, [type, user?.firmId, user?.id]);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column' }} spacing={{ xs: 3 }}>
        {existingIntegration ? (
          <DeleteIntegrationButton
            id={serviceIds.GOOGLE as IntegrationServiceId}
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
