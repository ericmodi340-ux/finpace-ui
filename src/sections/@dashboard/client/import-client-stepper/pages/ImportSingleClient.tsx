import React, { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import {
  MenuItem,
  Autocomplete,
  TextField,
  Grid,
  Typography,
  Box,
  Select,
  FormControl,
  InputLabel,
  ListItemText,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// types
import { IntegrationConfig, IntegrationOwner } from '../../../../../@types/integration';
// constants
import { statuses } from 'constants/users';
import useIntegrations from 'hooks/useIntegrations';
import { services } from 'constants/integrations';
import { getServiceName } from 'utils/integrations';
import { debounce } from 'lodash';
import {
  findAllClientFromIntegrationByEmail,
  importClientFromIntegration,
} from 'redux/slices/clients';

// ----------------------------------------------------------------------
function isValidEmail(email: string) {
  // Basic email validation using a regular expression
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

type IntegrationType = IntegrationConfig & { integrationOwner: string };

const ClientSelect = React.memo(
  ({
    selectedIntegration,
    handleSetOption,
    currentOptions,
  }: {
    selectedIntegration: IntegrationType;
    handleSetOption: (updateOption: any) => void;
    currentOptions: any;
  }) => {
    const [options, setOptions] = useState<any[]>([]);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchEmails = useCallback(
      async (query: string) => {
        try {
          setLoading(true);
          const response = await findAllClientFromIntegrationByEmail({
            integrationType: selectedIntegration.id,
            email: query,
            integrationOwner: selectedIntegration.integrationOwner as IntegrationOwner,
          });
          const updatedData = response.map((obj: any) => ({
            ...obj,
            email: query,
          }));
          setLoading(false);
          return updatedData;
        } catch (error) {
          console.error('Error fetching data:', error);
          enqueueSnackbar('Failed to fetch! Please reconnect your integration', {
            variant: 'error',
          });
          setLoading(false);
          return [];
        }
      },
      [enqueueSnackbar, selectedIntegration.id, selectedIntegration.integrationOwner]
    );

    const debouncedFetch = useCallback(
      debounce(async (query) => {
        if (query === '' || !isValidEmail(query)) {
          setOptions([]);
          return;
        }
        const data = await fetchEmails(query);
        setOptions(data || []);
      }, 1000),
      [selectedIntegration]
    );

    const handleInputChange = (_: any, value: string) => {
      setEmail(value);
      debouncedFetch(value);
    };

    return (
      <Autocomplete
        sx={{ mt: 3 }}
        options={options || []}
        loading={loading}
        inputValue={email}
        onInputChange={handleInputChange}
        filterOptions={(options) => options}
        renderInput={(params) => (
          <TextField
            {...params}
            helperText={
              isValidEmail(email) && !options.length && !loading
                ? 'No client found with this email'
                : currentOptions.integrationClient &&
                  `${currentOptions.integrationClient.name} (${currentOptions.integrationClient.id})`
            }
            label="Email"
            variant="outlined"
          />
        )}
        noOptionsText={
          email && isValidEmail(email) ? 'No clients found with this email' : 'Type email to search'
        }
        getOptionLabel={(option: any) => option?.email}
        onChange={(_, value) => handleSetOption({ integrationClient: value })}
        renderOption={(props, option: any) => (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid item sx={{ wordWrap: 'break-word' }}>
                <Box component="span" sx={{ fontWeight: 'bold' }}>
                  {option?.name}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {option?.email} ({option?.id})
                </Typography>
              </Grid>
            </Grid>
          </li>
        )}
      />
    );
  }
);

export default function ImportSingleClient({
  onContinue,
  handleSetOption,
  currentOptions,
  isProspect = false,
}: {
  onContinue: VoidFunction;
  handleSetOption: (updateOption: any) => void;
  currentOptions: any;
  isProspect?: boolean;
}) {
  const clientType = isProspect ? 'prospect' : 'client';
  const { integrations } = useIntegrations();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | null>(null);
  const [isClientProspect, setIsClientProspect] = useState(clientType);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const onSingleClientImport = async () => {
    try {
      if (!selectedIntegration) return;
      if (!currentOptions?.integrationClient) return;

      let payload = {
        integration: selectedIntegration.id,
        subtype: 'integration',
        type: 'import',
        integrationContactId: currentOptions.integrationClient?.id,
        clientType: isClientProspect,
        advisorId: currentOptions.advisorId,
        integrationOwner: selectedIntegration?.integrationOwner as IntegrationOwner,
        sync: true,
      };
      setLoading(true);
      const response = await importClientFromIntegration({
        data: payload,
      }).finally(() => setLoading(false));

      if (response?.status === 'completed') {
        handleSetOption({
          client: {
            id: response?.resultArray?.[0]?.clientId,
          },
          clientType: response?.resultArray?.[0]?.clientType,
        });
        enqueueSnackbar('Imported from CMS success', { variant: 'success' });
        onContinue();
      } else {
        enqueueSnackbar('Imported from CMS Failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('err', error);
      setLoading(false);
      // @ts-ignore
      if (error?.response?.data?.error === 'Client already exists.') {
        enqueueSnackbar('Client already exists', { variant: 'error' });
        handleSetOption({
          // @ts-ignore
          client: { id: error?.response?.data?.clientId, alreadyExist: true },
        });
        onContinue();
        // @ts-ignore
      } else if (error?.response?.data?.error) {
        // @ts-ignore
        enqueueSnackbar(error?.response?.data?.error, { variant: 'error' });
      } else {
        enqueueSnackbar('Error Importing from CMS', { variant: 'error' });
      }
    }
  };

  return (
    <>
      <FormControl sx={{ mt: 3 }} fullWidth>
        <InputLabel id="integration-label">Integration</InputLabel>
        <Select
          labelId="integration-label"
          label="Integration"
          value={selectedIntegration}
          onChange={(e) => setSelectedIntegration(e.target.value as IntegrationType)}
          variant="outlined"
        >
          {integrations.flatMap((integration) => {
            const service = services.find((service) => service.id === integration.id);
            if (
              integration.status === statuses.INACTIVE ||
              !service?.isAvailable ||
              !integration.fields // ? Only integrations with field keys will work with pulling
            ) {
              return [];
            }
            if (service.id === 'wealthbox' || service.id === 'redtail') {
              return (
                // @ts-ignore
                <MenuItem
                  key={`${integration.id}-${integration.integrationOwner}`}
                  value={integration}
                >
                  <ListItemText> {getServiceName(integration.id)} </ListItemText>
                  <Typography variant="body2" textTransform="capitalize" color="text.secondary">
                    {integration.integrationOwner}
                  </Typography>
                </MenuItem>
              );
            }

            return null;
          })}
        </Select>
      </FormControl>

      {selectedIntegration && (
        <>
          <FormControl sx={{ mt: 3 }} fullWidth>
            <InputLabel id="client-type-label">Customer Type</InputLabel>
            <Select
              labelId="client-type-label"
              value={isClientProspect}
              label="Customer Type"
              onChange={(e) => setIsClientProspect(e.target.value)}
              variant="outlined"
            >
              <MenuItem value={'client'}>
                <ListItemText>Client</ListItemText>
              </MenuItem>
              <MenuItem value={'prospect'}>
                <ListItemText>Prospect</ListItemText>
              </MenuItem>
            </Select>
          </FormControl>
          <ClientSelect
            handleSetOption={handleSetOption}
            currentOptions={currentOptions}
            selectedIntegration={selectedIntegration}
          />
        </>
      )}

      <LoadingButton
        type="submit"
        variant="contained"
        disabled={
          !selectedIntegration ||
          (!currentOptions?.integrationClient &&
            !isValidEmail(currentOptions?.integrationClient?.email))
        }
        onClick={onSingleClientImport}
        size="large"
        loading={loading}
        loadingIndicator="Loading..."
        sx={{ flex: 1, mt: 3, width: '100%' }}
        data-test="new-client-advisor-submit-button"
      >
        Continue
      </LoadingButton>
    </>
  );
}
