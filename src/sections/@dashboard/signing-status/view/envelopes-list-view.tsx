import { useState, useCallback, useMemo } from 'react';

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

import { useSelector } from 'redux/store';
import EnvelopeTableToolbar from '../envelopes-table-toolbar';
import {
  EnvelopeManager,
  IEnvelopeTableFilterValue,
  IEnvelopeTableFilters,
} from '../../../../@types/envelope';
import EnvelopesTableFiltersResult from '../envelopes-filters-result';
import EnvelopesTableRow from '../envelopes-table-row';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';
import { getSigningStatus } from 'utils/envelopes';

// ----------------------------------------------------------------------

const defaultFilters: IEnvelopeTableFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function EnvelopesListView() {
  const theme = useTheme();

  const { envelopes, isLoading } = useSelector((state) => state.envelopes);
  const template = useSelector((state) => state.templates.byId);
  const { authUser } = useUser();

  const TABLE_HEAD = [
    { id: 'clientName', label: 'Client', width: 300 },
    { id: 'documentTypeName', label: 'Document Type', width: 300 },
    { id: 'sentAt', label: 'Date Started', width: 150 },
    ...(authUser?.role === roles.FIRM_ADMIN
      ? [{ id: 'advisorName', label: 'Advisor', width: 200 }]
      : []),
    { id: 'status', label: 'Status', width: 80 },
    { id: 'completedAt', label: 'Completed Date', width: 150 },
    { id: 'recipientsLength', label: 'Recipients', align: 'center', width: 100 },
    { id: 'deliveryMethod', label: 'Delivery', width: 50 },
    { id: '' },
  ];

  const tableData = useMemo(
    () =>
      envelopes.map((envelope) => ({
        ...envelope,
        clientName: envelope?.client?.name || '',
        advisorName: envelope?.advisor?.name || '',
        documentTypeName: envelope?.templateId ? template[envelope?.templateId]?.title : '',
        recipientsLength: envelope.recipients ? Object.keys(envelope.recipients).length : 0,
        status: getSigningStatus(envelope),
      })),
    [envelopes, template]
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
  ] as const;

  const handleFilters = useCallback(
    (name: string, value: IEnvelopeTableFilterValue) => {
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

        <EnvelopeTableToolbar
          filters={filters}
          onFilters={handleFilters}
          //
          dateError={dateError}
        />

        {canReset && (
          <EnvelopesTableFiltersResult
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
                    <EnvelopesTableRow
                      key={row.id}
                      // @ts-ignore
                      row={row}
                      isLoading={isLoading}
                      authUser={authUser}
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
  inputData: EnvelopeManager[];
  comparator: (a: any, b: any) => number;
  filters: IEnvelopeTableFilters;
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
      (envelopes) => envelopes?.client?.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((envelopes) =>
        isBetween(envelopes?.sentAt || '', startDate, endDate)
      );
    }
  }

  if (status !== 'all') {
    inputData = inputData.filter((envelopes) => envelopes.status === status);
  }

  return inputData;
}
