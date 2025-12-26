import { useState, useEffect } from 'react';
import { sentenceCase } from 'change-case';
import { useSnackbar } from 'notistack';
// @mui
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { GridColumns, GridRenderCellParams, GridFilterItem } from '@mui/x-data-grid';
// redux
import { useSelector } from 'redux/store';
import { getTemplateFieldsById } from 'redux/slices/templates';
// @types
import { IntegrationServiceId } from '../../../@types/integration';
import { RedtailFields, SalesforceFields, WealthboxFields } from '../../../@types/integrationField';
import { TemplatesState } from '../../../@types/template';
// sections
import {
  RedtailFieldSelect,
  SalesforceFieldSelect,
  WealthboxFieldSelect,
} from './third-parties/field-selects';
// components
import DataListTable from 'components/DataListTable';
// hooks
import useEditingIntegrations from 'hooks/useEditingIntegrations';
import useIntegrationFields from 'hooks/useIntegrationFields';
// constants
import { serviceIds, services } from 'constants/integrations';

// ----------------------------------------------------------------------

type Props = {
  filterBy?: GridFilterItem[];
  hideColumns?: string[];
  pageSize?: number;
  templateId: string;
  integrationId: string;
};

type FieldListRow = { id: string; name: string; label: string; templates: string[] };

export default function CRMFieldMapper({
  filterBy = [],
  hideColumns = [],
  pageSize = 10,
  templateId,
  integrationId,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { type: integrationOwner } = useEditingIntegrations();
  const { integrationFields } = useIntegrationFields({
    integrationOwner,
    integrationType: integrationId as IntegrationServiceId,
  });

  const templates = useSelector((state) => state.templates) as TemplatesState;

  const [showFieldIds, setShowFieldIds] = useState(false);
  const [fieldList, setFieldList] = useState<Array<FieldListRow>>([]);

  useEffect(() => {
    const handleGetFieldsFromTemplates = async () => {
      const newBitsyFieldList: Array<FieldListRow> = [];

      // Generate the Finpace fields
      try {
        const templatesArray = await getTemplateFieldsById(templateId);
        newBitsyFieldList.push(...templatesArray);
      } catch (error) {
        enqueueSnackbar('Something went wrong getting Finpace fields', { variant: 'error' });
      }

      if (newBitsyFieldList) {
        setFieldList(newBitsyFieldList);
      }
    };

    handleGetFieldsFromTemplates();
  }, [enqueueSnackbar, templateId, templates.allIds]);

  const SERVICE_FIELDS = {
    [serviceIds.REDTAIL]: (bitsyFieldId: string) => {
      const props = {
        bitsyFieldId,
        fields: integrationFields as RedtailFields,
      };
      return <RedtailFieldSelect {...props} />;
    },
    [serviceIds.SALESFORCE]: (bitsyFieldId: string) => {
      const props = {
        bitsyFieldId,
        fields: integrationFields as SalesforceFields,
      };
      return <SalesforceFieldSelect {...props} />;
    },
    [serviceIds.WEALTHBOX]: (bitsyFieldId: string) => {
      const props = {
        bitsyFieldId,
        fields: integrationFields as WealthboxFields,
      };
      return <WealthboxFieldSelect {...props} />;
    },
  };

  const TABLE_COLUMNS: GridColumns = [
    {
      field: 'name',
      headerName: 'Finpace Field',
      hideable: false,
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="subtitle1">{params.row.label}</Typography>
          {showFieldIds && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {params.row.id}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: integrationId as string,
      headerName: `${
        services.find((service) => service.id === integrationId)?.name ||
        sentenceCase(integrationId)
      } Field`,
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <>{SERVICE_FIELDS[integrationId](params.row.id)}</>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      {TABLE_COLUMNS.length === 1 ? (
        <Alert severity="info">
          <AlertTitle>No mappable integrations found</AlertTitle>
          Please go back and configure a mappable integration.
        </Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showFieldIds}
                    onChange={(e) => setShowFieldIds(e.target.checked)}
                  />
                }
                label="Show field IDs"
              />
            </FormGroup>
          </Box>
          <Box sx={{ mx: -3 }}>
            <DataListTable
              data={fieldList}
              columns={TABLE_COLUMNS}
              searchPlaceholder={`Search fields...`}
              filterBy={filterBy}
              hideColumns={hideColumns}
              pageSize={pageSize}
              loading={templates.isLoading}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
