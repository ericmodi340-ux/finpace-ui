import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { TextField, Autocomplete } from '@mui/material';
// @types
import { IntegrationServiceId } from '../../../../../@types/integration';
import { SalesforceFieldCategory, SalesforceFields } from '../../../../../@types/integrationField';
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
  label: string;
  name: string;
  category: string;
};

interface Props {
  bitsyFieldId: string;
  fields: SalesforceFields;
}

// ----------------------------------------------------------------------

export default function SalesforceFieldSelect({ bitsyFieldId, fields }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();

  const { firm } = useSelector((state) => state.firm);

  const { type: integrationOwner, integrations } = useEditingIntegrations();
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.SALESFORCE
  );
  const existingIntegrationValue = existingIntegration?.fields?.[bitsyFieldId];

  const generateFieldOptions = useMemo(() => {
    let options: FieldOption[] = [];

    if (fields && Object.keys(fields).length) {
      Object.keys(fields).forEach((categoryId) => {
        const categoryFields = fields?.[categoryId as SalesforceFieldCategory];

        if (categoryFields?.length) {
          categoryFields.forEach((field) => {
            if (field.updateable) {
              const fieldId = `${categoryId}.${field.name}`;
              const fieldOption = {
                id: fieldId,
                label: fieldId,
                name: field.label || field.name || fieldId,
                category: categoryId,
              } as FieldOption;
              options.push(fieldOption);
            }
          });
        }
      });
    }

    return options;
  }, [fields]);

  const options = generateFieldOptions;

  const [value, setValue] = useState(
    existingIntegrationValue
      ? {
          id: existingIntegrationValue,
          label: existingIntegrationValue,
          name: existingIntegrationValue || '',
          category: '',
        }
      : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingIntegrationValue) {
      const options = generateFieldOptions;
      const newExistingValueOption = options.find(
        (option) => option.label === existingIntegrationValue
      );
      setValue(newExistingValueOption || null);
    }
  }, [existingIntegrationValue, generateFieldOptions]);

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

      if (integrationOwner === 'firm') {
        await updateFirmIntegrationsFieldsMapping(
          firm.id,
          serviceIds.SALESFORCE as IntegrationServiceId.SALESFORCE,
          newMapping
        );
      }
      if (integrationOwner === roles.ADVISOR) {
        await updateAdvisorIntegrationsFieldsMapping(
          user?.id || '',
          serviceIds.SALESFORCE as IntegrationServiceId.SALESFORCE,
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
