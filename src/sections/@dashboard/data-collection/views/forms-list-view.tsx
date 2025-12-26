import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { isAfter, isBetween } from 'utils/formatTime';

import Scrollbar from 'components/Scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'components/table';

import FormsTableToolbar from '../forms-table-toolbar';
import { FormManager, IFormTableFilterValue, IFormTableFilters } from '../../../../@types/form';
import FormsTableFiltersResult from '../forms-filters-result';
import FormsTableRow from '../forms-table-row';
import FormNewModal from './form-new-modal';
import { useBoolean } from 'hooks/useBoolean';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
import { PATH_DASHBOARD } from 'routes/paths';
import { Button, Dialog } from '@mui/material';
import Iconify from 'components/Iconify';
import FormCreateModal from '../form-create-modal';

// ----------------------------------------------------------------------

const defaultFilters: IFormTableFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function FormsListView() {
  const TABLE_HEAD = [
    { id: 'formTitle', label: 'Forms', width: 300 },
    { id: 'createdAt', label: 'Created' },
    { id: 'responses', label: 'Responses' },
    { id: 'previewLink', label: 'Preview Link' },
    { id: '' },
  ];

  const tableData = [{ id: '1', formTitle: 'Form 1', createdAt: '2021-01-01', responses: 0 }];

  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  const openCreateWithModal = useBoolean();

  const openCreateModal = useBoolean();

  const dataFiltered = tableData;
  // const dataFiltered = applyFilter({
  //   inputData: tableData,
  //   comparator: getComparator(table.order, table.orderBy),
  //   filters,
  //   dateError,
  // });

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset =
    !!filters.name || filters.status !== 'all' || (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

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
      <HeaderBreadcrumbs
        heading="Forms"
        links={[
          {
            name: 'Dashboard',
            href: PATH_DASHBOARD.root,
          },
          {
            name: 'Data Collection',
            href: PATH_DASHBOARD.dataCollection.root,
          },
          {
            name: 'Forms',
            href: PATH_DASHBOARD.dataCollection.forms,
          },
        ]}
        action={
          <Button
            startIcon={<Iconify icon="eva:plus-fill" />}
            variant="contained"
            color="primary"
            onClick={openCreateModal.onTrue}
          >
            New Form
          </Button>
        }
      />

      <Card>
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
                      row={row}
                      selected={table.selected.includes(row.id)}
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
        <FormNewModal open={openCreateWithModal.value} onClose={openCreateWithModal.onFalse} />
        <FormCreateModal open={openCreateModal.value} onClose={openCreateModal.onFalse} />
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
