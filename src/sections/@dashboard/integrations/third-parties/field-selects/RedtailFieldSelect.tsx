import { useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { TextField, Autocomplete } from '@mui/material';
// @types
import { IntegrationServiceId } from '../../../../../@types/integration';
import { RedtailFields, RedtailFieldCategory } from '../../../../../@types/integrationField';
// redux
import { useSelector } from 'redux/store';
import { updateFirmIntegrationsFieldsMapping } from 'redux/slices/integrationsFirm';
import { updateAdvisorIntegrationsFieldsMapping } from 'redux/slices/integrationsAdvisor';
// hooks
import useEditingIntegrations from 'hooks/useEditingIntegrations';
import useUser from 'hooks/useUser';
// constants
import { serviceIds } from 'constants/integrations';
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

type FieldOption = {
  id: string;
  name: string;
  label: string;
  category: RedtailFieldCategory;
};

interface Props {
  bitsyFieldId: string;
  fields: RedtailFields;
}

// ----------------------------------------------------------------------

export default function RedtailFieldSelect({ bitsyFieldId, fields }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();

  const { firm } = useSelector((state) => state.firm);

  const { type, integrations } = useEditingIntegrations();
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.REDTAIL
  );
  const existingIntegrationValue = existingIntegration?.fields?.[bitsyFieldId];

  const [value, setValue] = useState(
    existingIntegrationValue
      ? {
          id: existingIntegrationValue,
          label: existingIntegrationValue,
          name: existingIntegrationValue?.split('.')[1] || '',
          category: existingIntegrationValue?.split('.')[0] || '',
        }
      : null
  );
  const [loading, setLoading] = useState(false);

  let options: FieldOption[] = [];

  if (fields) {
    const fieldValues: any[] = Object.entries(fields);
    for (const [fieldKey, field] of fieldValues) {
      if (field && field.visible) {
        options.push({
          id: fieldKey,
          label: fieldKey,
          name: field.name || field.id,
          category: field.category || 'custom',
        });
      }
    }
  }

  const handleChange = async (value: FieldOption) => {
    try {
      setLoading(true);
      let newMapping = {
        ...(existingIntegration?.fields || {}),
      };

      if (!value) {
        delete newMapping[bitsyFieldId];
      } else {
        newMapping[bitsyFieldId] = value.label;
      }

      if (type === 'firm') {
        await updateFirmIntegrationsFieldsMapping(
          firm.id,
          serviceIds.REDTAIL as IntegrationServiceId.REDTAIL,
          newMapping
        );
      }
      if (type === roles.ADVISOR) {
        await updateAdvisorIntegrationsFieldsMapping(
          user?.id || '',
          serviceIds.REDTAIL as IntegrationServiceId.REDTAIL,
          newMapping
        );
      }
      enqueueSnackbar('Mapping saved!', { variant: 'success' });
      setValue(value);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  return (
    <Autocomplete
      fullWidth
      options={options}
      groupBy={(option) => option.category.toUpperCase()}
      value={value}
      onChange={(e, value) => handleChange(value as FieldOption)}
      loading={loading}
      disabled={loading}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      getOptionLabel={(option) => `${option.name || ''}`}
      renderOption={(props, option) => <li {...props}>{option.name || ''}</li>}
      renderInput={(params) => <TextField {...params} placeholder="Search fields…" />}
      sx={{ mr: 2 }}
    />
  );
}
