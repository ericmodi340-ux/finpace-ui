import { useEffect, useState, useRef } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { Box, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { AdvisorManager } from '../../../../../@types/advisor';
import { ClientManager } from '../../../../../@types/client';
import { IntegrationServiceId, IntegrationOwner } from '../../../../../@types/integration';
// redux
import { useSelector } from 'redux/store';
// utils
import getEnv from 'utils/getEnv';
import getEnvUrl from 'utils/getEnvUrl';
import { getIntegrationLastPushedAt } from 'utils/clients';
// constants
import { serviceIds } from 'constants/integrations';
import { urls } from 'constants/schwab';
import { getSchwabSaml } from 'redux/slices/schwab';

type Props = {
  client: ClientManager;
  advisor: AdvisorManager;
  integrationOwner: IntegrationOwner | undefined;
};

export default function SchwabDigitalAccountOpenButton({
  client,
  advisor,
  integrationOwner,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { firm } = useSelector((state) => state.firm);

  const [loading, setLoading] = useState(false);
  const [samlResponse, setSamlResponse] = useState('');

  const ssoSubmitRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (samlResponse && ssoSubmitRef.current) {
      ssoSubmitRef.current.click();
      enqueueSnackbar('Redirecting to Schwab...', { variant: 'success' });
    }
  }, [samlResponse, enqueueSnackbar]);

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

  const handleClick = async () => {
    try {
      setLoading(true);
      const res = await getSchwabSaml({ advisor });
      setSamlResponse(res.samlResponse);
      setLoading(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.response?.data.error || 'Something went wrong', { variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <Box>
      <Tooltip
        title={
          Boolean(clientHasUpdates)
            ? 'Client has more recent updates in Finpace. Please push them to Schwab before using DAO.'
            : !lastPushedAt
              ? 'Client must be pushed to Schwab before using DAO'
              : ''
        }
      >
        <div style={{ display: 'inline-block' }}>
          <LoadingButton
            onClick={handleClick}
            loading={loading}
            disabled={loading || !lastPushedAt || Boolean(clientHasUpdates)}
          >
            Schwab Digital Account Open
          </LoadingButton>
        </div>
      </Tooltip>
      <form
        method="post"
        action={`${urls[getEnv()]}/Login/Ssov2AuthHandler.ashx?CF=BitsySSO&sanc=F_DAO`}
        style={{ display: 'none' }}
      >
        <input type="textbox" name="SAMLResponse" defaultValue={samlResponse} />
        <input type="textbox" name="RelayState" defaultValue={getEnvUrl(firm)} />
        <input type="submit" value="Submit" ref={ssoSubmitRef} />
      </form>
    </Box>
  );
}
