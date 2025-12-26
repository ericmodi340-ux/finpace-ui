import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { TextField, Autocomplete } from '@mui/material';
// @types
import { IntegrationServiceId } from '../../../../../@types/integration';
import { WealthboxFields } from '../../../../../@types/integrationField';
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
  fields: WealthboxFields;
}

// ----------------------------------------------------------------------

export default function WealthboxFieldSelect({ bitsyFieldId, fields }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();

  const { firm } = useSelector((state) => state.firm);

  const { type: integrationOwner, integrations } = useEditingIntegrations();
  const existingIntegration = integrations.find(
    (integration) => integration.id === serviceIds.WEALTHBOX
  );
  const existingIntegrationValue = existingIntegration?.fields?.[bitsyFieldId];

  const generateFieldOptions = useMemo(() => {
    let options: FieldOption[] = [];
    if (fields && Object.keys(fields).length) {
      Object.keys(fields).forEach((fieldId) => {
        const field = fields?.[fieldId];
        switch (field.type) {
          case 'array':
            const arrayId = fieldId;
            const arrayName = field.name;
            const arraySubFields = field.fields;

            if (arraySubFields && Object.keys(arraySubFields).length) {
              Object.keys(arraySubFields).forEach((subFieldId) => {
                const subField = arraySubFields?.[subFieldId];

                if (subField && subField.visible) {
                  const arraySubFieldId = `${arrayId}[0].${subFieldId}`; // TODO: [DEV-588] Dynamic Wealthbox array field querying
                  const fieldOption = {
                    id: arraySubFieldId,
                    label: arraySubFieldId,
                    name: subField?.name || '',
                    category: arrayName,
                  } as FieldOption;
                  options.push(fieldOption);
                }
              });
            }
            break;
          case 'object':
            const objectId = fieldId;
            const objectName = field.name;
            const objectSubFields = field.fields;

            if (objectSubFields && Object.keys(objectSubFields).length) {
              Object.keys(objectSubFields).forEach((subFieldId) => {
                const subField = objectSubFields?.[subFieldId];

                if (subField && subField.visible) {
                  const objectSubFieldId = `${objectId}.${subFieldId}`;
                  const fieldOption = {
                    id: objectSubFieldId,
                    label: objectSubFieldId,
                    name: subField?.name || '',
                    category: objectName,
                  } as FieldOption;
                  options.push(fieldOption);
                }
              });
            }
            break;
          default:
            if (field && field.visible) {
              const fieldOption = {
                id: fieldId,
                label: fieldId,
                name: field.name || fieldId,
                category: field.category || 'General',
              } as FieldOption;
              options.push(fieldOption);
            }
            break;
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
          serviceIds.WEALTHBOX as IntegrationServiceId.WEALTHBOX,
          newMapping
        );
      }
      if (integrationOwner === roles.ADVISOR) {
        await updateAdvisorIntegrationsFieldsMapping(
          user?.id || '',
          serviceIds.WEALTHBOX as IntegrationServiceId.WEALTHBOX,
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
