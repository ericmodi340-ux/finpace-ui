import { useState, useCallback, useMemo, useEffect } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { isAfter, isBetween } from 'utils/formatTime';

import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TableSelectedAction,
} from 'components/table';

import { useDispatch, useSelector } from 'redux/store';
import ClientsTableToolbar from '../client-table-toolbar';
import ClientTableRow from '../client-table-row';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';
import arrayFromObj from 'utils/arrayFromObj';
import {
  ClientManager,
  IClientsTableFilterValue,
  IClientsTableFilters,
} from '../../../../@types/client';
import ClientsTableFiltersResult from '../client-filters-result';
import { deleteClient, updateClientsTags, getClients } from 'redux/slices/clients';
import { useSnackbar } from 'notistack';
import { Box, Button, Stack, tableCellClasses, tablePaginationClasses } from '@mui/material';
import { useBoolean } from 'hooks/useBoolean';
import AssignTagsModal from '../assign-tags-modal';
import { getForms } from 'redux/slices/forms';
import { getEnvelopes } from 'redux/slices/envelopes';
// ----------------------------------------------------------------------

const defaultFilters: IClientsTableFilters = {
  name: '',
  type: 'all',
  startDate: null,
  endDate: null,
  tag: [], // Changed from 'all' to an empty array
};

// ----------------------------------------------------------------------

export default function ClientListView({ filter }: { filter?: (item: ClientManager) => boolean }) {
  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const clients = useSelector((state) => state.clients);
  const advisors = useSelector((state) => state.advisors);
  const clientsList = arrayFromObj(clients.byId, clients.allIds) as ClientManager[];
  const clientsArray = filter !== undefined ? clientsList.filter(filter) : clientsList;
  const { authUser } = useUser();
  const openAssignTagsModal = useBoolean();

  const TABLE_HEAD = [
    { id: 'name', label: 'Client Name' },
    ...(authUser?.role === roles.FIRM_ADMIN
      ? [{ id: 'advisorName', label: 'Advisor', width: 200 }]
      : []),
    { id: 'clientType', label: 'Type', width: 120 },
    { id: 'status', label: 'Status', width: 120 },
    { id: 'tags', label: 'Tags', width: 200 }, // <-- Add this line
    { id: '', width: 88 },
  ];

  const tableData = useMemo(
    () =>
      clientsArray.map((client) => ({
        ...client,
        advisorName: advisors.byId[client.advisorId]?.name || '',
        clientType: client.isProspect ? 'prospect' : 'client',
      })),
    [advisors.byId, clientsArray]
  );

  const table = useTable({
    defaultOrderBy: 'createdAt',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10,
  });

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const canReset =
    !!filters.name ||
    filters.type !== 'all' ||
    (Array.isArray(filters.tag) && filters.tag.length > 0) || // Updated check for tag filters
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IClientsTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteClient(userId);
      enqueueSnackbar('Delete user success', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const { loaded: formsLoaded } = useSelector((state) => state.forms);

  const { loaded: envelopeLoaded } = useSelector((state) => state.envelopes);

  useEffect(() => {
    const loadData = () => {
      if (!formsLoaded) {
        dispatch(getForms());
      }
      if (!envelopeLoaded) {
        dispatch(getEnvelopes());
      }
      // Always refresh clients data
      dispatch(getClients());
    };

    // Load data immediately
    loadData();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(loadData, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [dispatch, envelopeLoaded, formsLoaded]);

  return (
    <>
      <Stack
        spacing={2.5}
        sx={{
          my: 3,
        }}
      >
        <ClientsTableToolbar
          filters={filters}
          onFilters={handleFilters}
          //
          dateError={dateError}
          dataFiltered={dataFiltered}
          table={table}
        />

        {canReset && (
          <ClientsTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            //
            onResetFilters={handleResetFilters}
            //
            results={dataFiltered.length}
          />
        )}
      </Stack>
      {openAssignTagsModal.value && (
        <AssignTagsModal
          open={openAssignTagsModal.value}
          onClose={openAssignTagsModal.onFalse}
          loading={clients.isLoading}
          onSubmit={async (tags) => {
            table.onSelectAllRows(false, table.selected);
            await updateClientsTags(table.selected, tags);
            enqueueSnackbar('Assign tags success! Please refresh the page', { variant: 'success' });
            openAssignTagsModal.onFalse();
          }}
        />
      )}
      <Box
        sx={{
          position: 'relative',
          m: theme.spacing(-2, -3, -3, -3),
        }}
      >
        <TableSelectedAction
          dense={table.dense}
          numSelected={table.selected.length}
          rowCount={dataFiltered.length}
          onSelectAllRows={(checked) =>
            table.onSelectAllRows(
              checked,
              dataFiltered.map((row) => row.id)
            )
          }
          action={
            <>
              <Button onClick={openAssignTagsModal.onTrue}>Assign Tags</Button>
            </>
          }
          sx={{
            pl: 3,
            pr: 2,
            top: 16,
            left: 24,
            right: 24,
            width: 'auto',
            borderRadius: 1.5,
          }}
        />
        <TableContainer
          sx={{
            p: theme.spacing(0, 3, 3, 3),
          }}
        >
          <Table
            size={table.dense ? 'small' : 'medium'}
            sx={{
              minWidth: 960,
              borderCollapse: 'separate',
              borderSpacing: '0 16px',
            }}
          >
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              sx={{
                [`& .${tableCellClasses.head}`]: {
                  backgroundColor: theme.palette.background.paper,
                  '&:first-of-type': {
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                  },
                  '&:last-of-type': {
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                  },
                },
              }}
            />

            <TableBody>
              {dataFiltered
                .slice(
                  table.page * table.rowsPerPage,
                  table.page * table.rowsPerPage + table.rowsPerPage
                )
                .map((row) => (
                  <ClientTableRow
                    key={row.id}
                    row={row}
                    isLoading={clients.isLoading}
                    authUser={authUser}
                    selected={table.selected.includes(row.id)}
                    onSelectRow={() => table.onSelectRow(row.id)}
                    handleDeleteUser={handleDeleteUser}
                  />
                ))}

              <TableNoData
                notFound={notFound}
                sx={{
                  m: -2,
                  borderRadius: 1.5,
                  border: `dashed 1px ${theme.palette.divider}`,
                }}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
  dateError,
}: {
  inputData: ClientManager[];
  comparator: (a: any, b: any) => number;
  filters: IClientsTableFilters;
  dateError: boolean;
}) {
  const { name, type, startDate, endDate, tag } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) =>
        String(user?.name?.trim()).toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        String(user?.email).toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        String(user?.firstName?.trim() + ' ' + user?.lastName?.trim())
          .toLowerCase()
          .indexOf(name.toLowerCase()) !== -1
    );
  }

  // Updated tag filtering to handle multiple tags
  if (Array.isArray(tag) && tag.length > 0) {
    inputData = inputData.filter((user) => {
      if (!user?.tags || !Array.isArray(user.tags)) {
        return false;
      }
      return tag.some((selectedTag) => user.tags.includes(selectedTag));
    });
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((user) => isBetween(user.createdAt, startDate, endDate));
    }
  }

  if (type !== 'all') {
    // @ts-ignore
    inputData = inputData.filter((user) => user?.clientType === type);
  }

  return inputData;
}
