import { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { Autocomplete, TextField, Stack, Button } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
// @types
import { TemplateWithFieldsManager } from '../../../../../@types/template';
// redux
import { updateTemplate } from 'redux/slices/templates';
// components
import DataListTable from 'components/DataListTable';
import { useParams } from 'react-router';

const FieldMappingTable = ({
  dsTemplateTabs,
  dsFieldMapping,
  template,
  templateFields,
}: {
  dsTemplateTabs: any;
  dsFieldMapping: any;
  template: TemplateWithFieldsManager;
  templateFields: any[];
}) => {
  const [changedDsFieldMapping, setChangedDsFieldMapping] = useState<{ [key: string]: string }>({});
  const [localDsFieldMapping, setLocalDsFieldMapping] = useState<{ [key: string]: string }>(
    () => dsFieldMapping || {}
  );
  const { templateId } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();

  const bitsyClientFields = useMemo(
    () => [
      {
        type: 'text',
        key: 'compositeName',
        label: 'Composite Name (Primary & Joint Investor, if any)',
      },
      ...templateFields,
    ],
    [templateFields]
  );
  const bitsyAdvisorFields = useMemo(
    () => [
      { type: 'text', key: 'name', label: 'Name' },
      { type: 'text', key: 'email', label: 'Email' },
      { type: 'text', key: 'crd', label: 'CRD' },
    ],
    []
  );
  const bitsyFirmFields = useMemo(
    () => [
      { type: 'text', key: 'name', label: 'Name' },
      { type: 'text', key: 'email', label: 'Email' },
    ],
    []
  );

  const bitsyFieldOptions = useMemo(
    () => [
      ...bitsyClientFields.flatMap((templateField) => {
        const { type, key, label } = templateField;
        const fieldId = key || type;

        if (['content', 'panel'].includes(type) || !fieldId || !label) {
          return [];
        }

        return {
          key: `$.client.${fieldId}`,
          label: label,
          object: 'client',
        };
      }),
      ...bitsyAdvisorFields.map((field) => ({
        key: `$.advisor.${field.key}`,
        label: field.label,
        object: 'advisor',
      })),
      ...bitsyFirmFields.map((field) => ({
        key: `$.firm.${field.key}`,
        label: field.label,
        object: 'firm',
      })),
    ],
    [bitsyAdvisorFields, bitsyClientFields, bitsyFirmFields]
  );

  const data = useMemo(() => {
    let dataRows = [] as any[];

    Object.keys(dsTemplateTabs).forEach((dsTemplateTabType) => {
      if (['dateSignedTabs', 'signHereTabs', 'initialHereTabs'].includes(dsTemplateTabType)) {
        return;
      }

      let dsTemplateTabTypeName = dsTemplateTabType.replace(/([A-Z])/g, ' $1');
      dsTemplateTabTypeName =
        dsTemplateTabTypeName.charAt(0).toUpperCase() +
        dsTemplateTabTypeName.slice(1, dsTemplateTabTypeName.length - 5);

      const dsTemplateTabTypeTabs = dsTemplateTabs[dsTemplateTabType];

      if (dsTemplateTabTypeTabs && dsTemplateTabTypeTabs.length) {
        dsTemplateTabTypeTabs.forEach((dsTemplateTabObject: any, dstidx: any) => {
          const { tabLabel, groupName } = dsTemplateTabObject;
          const tabName = tabLabel || groupName;

          const bitsyFieldMapping = localDsFieldMapping?.[tabName] || '';

          const bitsyField: any = bitsyFieldMapping
            ? bitsyFieldOptions.find((item) => item.key === bitsyFieldMapping)
            : null;

          dataRows.push({
            id: `${tabName}-${dstidx}`,
            name: `${tabName} ${bitsyField?.label || ''}`, // used for search field
            tab: tabName,
            type: dsTemplateTabTypeName,
          });
        });
      }
    });

    return dataRows;
  }, [bitsyFieldOptions, localDsFieldMapping, dsTemplateTabs]);

  const handleDsFieldMappingChange = useCallback(
    ({ event, option, row }: { event: any; option: any; row: any }) => {
      event.stopPropagation();
      event.preventDefault();

      if (option.key) {
        const newOptionKey = typeof option === 'string' ? option : option?.key;
        if (dsFieldMapping) {
          setChangedDsFieldMapping((prevState: any) => ({
            ...prevState,
            [row.tab]: newOptionKey,
          }));
          setLocalDsFieldMapping((prevState: any) => ({
            ...prevState,
            [row.tab]: newOptionKey,
          }));
        }
      }
    },
    [dsFieldMapping]
  );

  const handleSaveClick = useCallback(async () => {
    setIsLoading(true);
    const newDsFieldMapping = { ...dsFieldMapping, ...changedDsFieldMapping };

    try {
      if (templateId) {
        await updateTemplate(templateId, { ...template, dsFieldMapping: newDsFieldMapping })
          .then(() => {
            enqueueSnackbar('Successfully updated!', { variant: 'success' });
          })
          .catch((err) => {
            enqueueSnackbar('Oops! Something went wrong.', { variant: 'error' });
          });
      }
    } catch (e) {
      enqueueSnackbar('Oops! Something went wrong.', { variant: 'error' });
    }

    setIsLoading(false);
  }, [changedDsFieldMapping, dsFieldMapping, enqueueSnackbar, template, templateId]);

  const handleCancelClick = useCallback(() => {
    setLocalDsFieldMapping(dsFieldMapping);
    setChangedDsFieldMapping({});
  }, [setLocalDsFieldMapping, dsFieldMapping, setChangedDsFieldMapping]);

  const TABLE_COLUMNS = [
    {
      field: 'tab',
      headerName: 'DocuSign Document Tab',
      hideable: false,
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'bitsy-field',
      headerName: 'Finpace Form Field',
      flex: 0.6,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params;

        const fieldKey = localDsFieldMapping?.[row.tab] || '';

        const optionValue: any = fieldKey
          ? bitsyFieldOptions.find((item) => item.key === fieldKey)
          : null;

        const value = optionValue
          ? {
              key: optionValue.key,
              label: optionValue.label,
              object: optionValue.object,
            }
          : {
              key: fieldKey || '',
              label: fieldKey || '',
              object: fieldKey || '',
            };

        return (
          <Autocomplete
            key={`${row.id}`}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            value={value}
            options={bitsyFieldOptions}
            groupBy={(option) => option.object.toUpperCase()}
            freeSolo
            autoSelect
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : (option?.label ?? '')
            }
            onChange={(event, option) => handleDsFieldMappingChange({ event, option, row })}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField key={`${row.id}`} {...params} placeholder="Select a Field" />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.key}>
                {option.label}
              </li>
            )}
            sx={{ width: '100%' }}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataListTable
        disableSelectionOnClick
        data={data}
        columns={TABLE_COLUMNS}
        searchPlaceholder={`Search fields...`}
        loading={isLoading}
      />
      <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disabled={Object.keys(changedDsFieldMapping).length === 0 || isLoading}
          onClick={handleSaveClick}
        >
          Save
        </Button>
        <Button variant="outlined" onClick={handleCancelClick}>
          Cancel
        </Button>
      </Stack>
    </>
  );
};

export default FieldMappingTable;
