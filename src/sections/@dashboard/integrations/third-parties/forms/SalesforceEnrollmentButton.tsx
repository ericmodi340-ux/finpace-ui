import { useEffect, useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import {
  Box,
  Stack,
  Alert,
  AlertTitle,
  Typography,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// @types
import { IntegrationServiceId, IntegrationStatus } from '../../../../../@types/integration';
// redux
import { useSelector } from 'redux/store';
import { updateFirmIntegration } from 'redux/slices/integrationsFirm';
import { updateAdvisorIntegration } from 'redux/slices/integrationsAdvisor';
import { getSalesforceEnrollment } from 'redux/slices/salesforce';
// components
import DeleteIntegrationButton from 'components/DeleteIntegrationButton';
// hooks
import useEditingIntegrations from 'hooks/useEditingIntegrations';
import useUser from 'hooks/useUser';
// constants
import { roles } from 'constants/users';
import { serviceIds, statuses } from 'constants/integrations';

// ----------------------------------------------------------------------

interface Props {
  successEvent: () => void;
}

// ----------------------------------------------------------------------

export default function SalesforceEnrollmentButton(props: Props) {
  const { successEvent } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();

  const { firm } = useSelector((state) => state.firm);
  const { type, integrations } = useEditingIntegrations();
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.SALESFORCE
  );

  const [loading, setLoading] = useState(false);
  const [tempStatus, setTempStatus] = useState(existingIntegration?.status);

  const handleUpdateStatus = useCallback(
    async (newStatus: IntegrationStatus) => {
      try {
        const newIntegration = {
          status: newStatus,
        };
        if (type === 'firm') {
          await updateFirmIntegration(
            firm.id,
            serviceIds.SALESFORCE as IntegrationServiceId,
            newIntegration
          );
        }
        if (type === roles.ADVISOR) {
          await updateAdvisorIntegration(
            user?.id || '',
            serviceIds.SALESFORCE as IntegrationServiceId,
            newIntegration
          );
        }
        enqueueSnackbar('Configuration saved!', { variant: 'success' });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    },
    [enqueueSnackbar, firm.id, type, user?.id]
  );

  const handleClick = async () => {
    try {
      setLoading(true);
      const res = await getSalesforceEnrollment();
      console.log(res);
      if (res?.authUrl) {
        window.location.href = res?.authUrl;
      } else {
        enqueueSnackbar('Something went wrong getting redirect URL', { variant: 'error' });
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.response?.data.error || 'Something went wrong', { variant: 'error' });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tempStatus && existingIntegration && tempStatus !== existingIntegration?.status) {
      handleUpdateStatus(tempStatus);
    }
  }, [existingIntegration, handleUpdateStatus, tempStatus]);

  return (
    <Stack spacing={3}>
      {existingIntegration ? (
        <>
          <Box>
            {existingIntegration.status === statuses.ACTIVE ? (
              <Alert severity="success" sx={{ width: 'auto' }}>
                <AlertTitle>Your account is connected!</AlertTitle>
                Looks like the Salesforce integration is all set. We'll take it from here!
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ width: 'auto' }}>
                <AlertTitle>This integration is inactive</AlertTitle>
                Your account is configured, but the integration is inactive. Toggle it as active
                below to use your Salesforce account with Finpace!
              </Alert>
            )}
          </Box>

          <Box>
            <FormControlLabel
              labelPlacement="start"
              control={
                <Switch
                  onChange={(event) =>
                    setTempStatus(
                      event.target.checked
                        ? (statuses.ACTIVE as IntegrationStatus.ACTIVE)
                        : (statuses.INACTIVE as IntegrationStatus.INACTIVE)
                    )
                  }
                  checked={tempStatus === statuses.ACTIVE}
                  disabled={loading}
                />
              }
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Integration is {existingIntegration.status || statuses.INACTIVE}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {existingIntegration.status === statuses.ACTIVE
                      ? 'Toggling this off will disable this integration'
                      : 'Toggling this on will enable this integration'}
                  </Typography>
                </>
              }
              sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
            />
          </Box>

          <Tooltip title="Only do this if you would like to permanently remove the connection to this Salesforce account. Otherwise, you can mark the integration as inactive using the toggle above.">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <DeleteIntegrationButton
                id={serviceIds.SALESFORCE as IntegrationServiceId}
                successEvent={successEvent}
              />
            </div>
          </Tooltip>
        </>
      ) : (
        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          disabled={loading}
          onClick={() => handleClick()}
        >
          Connect with Salesforce
        </LoadingButton>
      )}
    </Stack>
  );
}
