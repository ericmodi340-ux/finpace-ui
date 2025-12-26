import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useSearchParams } from 'react-router-dom';
// @mui
import { LoadingButton } from '@mui/lab';
import { DialogTitle, Box, DialogActions, Button } from '@mui/material';
import { GridSelectionModel } from '@mui/x-data-grid';
// @types
import { ClientManager } from '../../../../../@types/client';
import { IntegrationServiceId } from '../../../../../@types/integration';
import { FormManager } from '../../../../../@types/form';
import { UserRole } from '../../../../../@types/user';
// redux
import { getClientFromIntegration, pushClientToIntegration } from 'redux/slices/clients';
// components
import DataListTable from 'components/DataListTable';
import { sentenceCase } from 'change-case';
// hooks
import useUserFromStore from 'hooks/useUserFromStore';
// constants
import { roles } from 'constants/users';
import { serviceIds } from 'constants/integrations';

type Props = {
  handleCloseConfirm: () => void;
  currentForm?: FormManager;
};

export default function LaserAppList({ handleCloseConfirm, currentForm }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [formList, setFormList] = useState([]);
  const integrationOwner = 'firm';
  const [queryParameters] = useSearchParams();
  const { clientId: paramId } = useParams<{ clientId: string }>();
  const clientId = (queryParameters.get('clientId') as string) || paramId;

  const client = useUserFromStore(
    currentForm?.clientId || clientId,
    roles.CLIENT as UserRole.CLIENT
  ) as ClientManager;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<{ filename: string; majv: string }[]>([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setIsLoading(true);
        const crmClientForms = await getClientFromIntegration({
          integrationType: serviceIds.LASERAPP as IntegrationServiceId.LASERAPP,
          integrationOwner,
          clientId: client.id,
        });
        setFormList(crmClientForms || []);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(sentenceCase(error.response?.data.error || '') || 'Something went wrong', {
          variant: 'error',
        });
      }
    };
    fetchForms();
  }, [client.id, enqueueSnackbar, integrationOwner]);

  if (!integrationOwner) {
    return <></>;
  }

  const handlePush = async () => {
    try {
      setIsLoading(true);
      const response = await pushClientToIntegration({
        integrationType: serviceIds.LASERAPP as IntegrationServiceId.LASERAPP,
        integrationOwner,
        client: {
          ...client,
          laserAppForms: selectedRows,
        },
      });
      if (response?.redurl) window.open(response?.redurl, '_blank');
      handleCloseConfirm();
      enqueueSnackbar('Client pushed to LaserApp!', { variant: 'success' });
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(sentenceCase(error.response?.data.error || '') || 'Something went wrong', {
        variant: 'error',
      });
      setIsLoading(false);
    }
  };

  const handleSelectionModelChange = (selectionModel: GridSelectionModel) => {
    const selectedIDs = new Set(selectionModel);
    const filteredRows = formList.filter((row: { filename: string; majv: string }) =>
      selectedIDs.has(row.filename)
    );
    const selectedRows = filteredRows.map(
      (row: { filename: string; majv: string }) =>
        ({
          filename: row.filename,
          majv: row.majv,
        }) as { filename: string; majv: string }
    );
    setSelectedRows(selectedRows);
  };

  return (
    <>
      <DialogTitle>Are you sure?</DialogTitle>
      <Box sx={{ p: 3 }}>
        <DataListTable
          data={formList}
          columns={[{ field: 'title', headerName: 'Title', flex: 1 }]}
          getRowId={(row) => row.filename}
          checkboxSelection
          onSelectionModelChange={handleSelectionModelChange}
          loading={isLoading}
        />
      </Box>
      <DialogActions>
        <Button onClick={handleCloseConfirm} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <LoadingButton
          color="primary"
          variant="contained"
          disabled={isLoading}
          loading={isLoading}
          onClick={handlePush}
          sx={{ textTransform: 'none' }}
        >
          Yes, push client
        </LoadingButton>
      </DialogActions>
    </>
  );
}
