import { useState, useCallback, useMemo, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { isAfter, isBetween } from 'utils/formatTime';

import Label from 'components/Label';
import Scrollbar from 'components/Scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'components/table';

import { useSelector, useDispatch } from 'redux/store';
import { getForms } from 'redux/slices/forms';
import { getClients } from 'redux/slices/clients';
import { getEnvelopes } from 'redux/slices/envelopes';
import { getAdvisors } from 'redux/slices/advisors';
import FormsTableToolbar from '../forms-table-toolbar';
import {
  FormManager,
  IFormTableFilterValue,
  IFormTableFilters,
  FormStatus,
} from '../../../../@types/form';
import FormsTableFiltersResult from '../forms-filters-result';
import FormsTableRow from '../forms-table-row';
import { formStatuses } from 'constants/forms';
import arrayFromObj from 'utils/arrayFromObj';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';
import { startCase } from 'lodash';
import { getSigningStatus } from 'utils/forms';

// ----------------------------------------------------------------------

const defaultFilters: IFormTableFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function FormsListView() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const template = useSelector((state) => state.templates.byId);
  const clients = useSelector((state) => state.clients.byId);
  const advisors = useSelector((state) => state.advisors.byId);
  const { authUser } = useUser();

  // Load data function for polling
  const loadData = useCallback(() => {
    dispatch(getForms());
    dispatch(getClients());
    dispatch(getEnvelopes());
    dispatch(getAdvisors());
  }, [dispatch]);

  // Set up polling on component mount
  useEffect(() => {
    // Load data immediately
    loadData();

    // Set up polling interval for 30 seconds
    const interval = setInterval(loadData, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [loadData]);

  const TABLE_HEAD = [
    { id: 'clientName', label: 'Client' },
    { id: 'formTitle', label: 'Form Title', width: 200 },
    { id: 'createdAt', label: 'Date Started', width: 150 },
    { id: 'dateSent', label: 'Date Sent', width: 150 },
    ...(authUser?.role === roles.FIRM_ADMIN
      ? [{ id: 'advisorName', label: 'Advisor', width: 150 }]
      : []),
    { id: 'status', label: 'Status', width: 80 },
    { id: '' },
  ];

  const { allIds: formsAllIds, byId: formsById, isLoading } = useSelector((state) => state.forms);

  const forms = useMemo(
    () => arrayFromObj(formsById, formsAllIds) as FormManager[],
    [formsAllIds, formsById]
  );

  const tableData = useMemo(
    () =>
      forms.map((form) => ({
        ...form,
        clientName: clients[form.clientId]?.name || '',
        advisorName: advisors[form.advisorId]?.name || '',
        documentTypeName: form?.templateId ? template[form?.templateId]?.title : '',
        status: getSigningStatus(form),
      })),
    [forms, template, advisors, clients]
  );

  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset =
    !!filters.name || filters.status !== 'all' || (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getEnvelopLength = (status: string) =>
    tableData.filter((item) => item.status === status).length;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
    {
      value: 'Awaiting Client',
      label: 'Awaiting Client',
      color: 'secondary',
      count: getEnvelopLength('Awaiting Client'),
    },
    {
      value: 'Awaiting Advisor',
      label: 'Awaiting Advisor',
      color: 'warning',
      count: getEnvelopLength('Awaiting Advisor'),
    },
    {
      value: 'completed',
      label: 'Completed',
      color: 'success',
      count: getEnvelopLength('completed'),
    },
    {
      value: 'cancelled',
      label: 'Canceled',
      color: 'error',
      count: getEnvelopLength('cancelled'),
    },
    {
      value: 'draft',
      label: 'Draft',
      color: 'info',
      count: getEnvelopLength('draft'),
    },
  ] as const;

  const handleFilters = useCallback(
    (name: string, value: IFormTableFilterValue) => {
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

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <>
      <Card>
        <Tabs
          value={filters.status}
          onChange={handleFilterStatus}
          sx={{
            px: 2.5,
            pt: 1,
            boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label
                  variant={
                    ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'ghost'
                  }
                  color={tab.color}
                  sx={{ ml: 1 }}
                >
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        <FormsTableToolbar
          filters={filters}
          onFilters={handleFilters}
          //
          dateError={dateError}
        />

        {canReset && (
          <FormsTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            //
            onResetFilters={handleResetFilters}
            //
            results={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                onSort={table.onSort}
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <FormsTableRow
                      key={row.id}
                      // @ts-ignore
                      row={row}
                      authUser={authUser}
                      isLoading={isLoading}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
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
  inputData: FormManager[];
  comparator: (a: any, b: any) => number;
  filters: IFormTableFilters;
  dateError: boolean;
}) {
  const { name, status, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      // @ts-ignore
      (form) => form?.clientName?.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((envelopes) =>
        isBetween(envelopes.createdAt, startDate, endDate)
      );
    }
  }

  if (status !== 'all') {
    inputData = inputData.filter((envelopes) => envelopes.status === status);
  }

  return inputData;
}
