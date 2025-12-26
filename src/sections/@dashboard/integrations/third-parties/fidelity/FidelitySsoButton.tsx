import { useEffect, useState, useRef } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { IntegrationOwner } from '../../../../../@types/integration';
import { getFidelitySaml } from 'redux/slices/fidelity';

type Props = {
  advisor: any;
  integrationOwner: IntegrationOwner | undefined;
};

export default function FidelitySsoButton({ advisor, integrationOwner }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [samlResponse, setSamlResponse] = useState('');

  const ssoSubmitRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (samlResponse && ssoSubmitRef.current) {
      ssoSubmitRef.current.click();
      enqueueSnackbar('Redirecting to Wealthscape...', { variant: 'success' });
    }
  }, [samlResponse, enqueueSnackbar]);

  if (!integrationOwner) {
    return <></>;
  }

  const handleClick = async () => {
    try {
      setLoading(true);
      const res = await getFidelitySaml({ advisor });
      setSamlResponse(res.samlResponse);
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.response?.data.error || 'Something went wrong', { variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <Box>
      <LoadingButton
        fullWidth
        sx={{ mt: 1 }}
        variant="contained"
        onClick={handleClick}
        loading={loading}
      >
        Fidelity Wealthscape SSO
      </LoadingButton>
      <form
        method="post"
        action={`https://login.advisorchannel.com/ftgw/Fas/nfExternal/WCRep/InboundSSO/consumer/sp/ACS.saml2`}
        target="_blank"
        style={{ display: 'none' }}
      >
        <input type="textbox" name="SAMLResponse" defaultValue={samlResponse} />
        <input type="textbox" name="RelayState" />
        <input type="submit" value="Submit" ref={ssoSubmitRef} />
      </form>
    </Box>
  );
}
