import { useState, useCallback, useMemo } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

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
import AdvisorsTableToolbar from '../advisor-table-toolbar';
import AdvisorTableRow from '../advisor-table-row';
import useUser from 'hooks/useUser';
import arrayFromObj from 'utils/arrayFromObj';
import AdvisorsTableFiltersResult from '../advisor-filters-result';
import { useSnackbar } from 'notistack';
import {
  AdvisorManager,
  IAdvisorsTableFilterValue,
  IAdvisorsTableFilters,
} from '../../../../@types/advisor';
import { UserStatus } from '../../../../@types/user';
import { statuses } from 'constants/users';
import { deleteAdvisor } from 'redux/slices/advisors';
// ----------------------------------------------------------------------

const defaultFilters: IAdvisorsTableFilters = {
  name: '',
  status: 'all',
};

// ----------------------------------------------------------------------

export default function AdvisorsListView({
  filter,
}: {
  filter?: (item: AdvisorManager) => boolean;
}) {
  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const advisors = useSelector((state) => state.advisors);
  const advisorsList = arrayFromObj(advisors.byId, advisors.allIds) as AdvisorManager[];
  const { authUser } = useUser();

  const TABLE_HEAD = [
    { id: 'name', label: 'Advisor Name' },
    { id: 'email', label: 'Email' },
    { id: 'status', label: 'Status' },
    { id: '', width: 80 },
  ];

  const tableData = useMemo(
    () =>
      (filter !== undefined ? advisorsList.filter(filter) : advisorsList).filter(
        (advisor) =>
          !advisor.isFirmAdmin || (advisor.isFirmAdmin && advisor.status !== statuses.INACTIVE)
      ),
    [advisorsList, filter]
  );

  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !!filters.name || filters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getLengthByStatus = (status: string) =>
    tableData.filter((item) => item.status === status).length;

  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
    {
      value: UserStatus.ACTIVE,
      label: 'Active',
      color: 'secondary',
      count: getLengthByStatus(UserStatus.ACTIVE),
    },
    {
      value: UserStatus.INACTIVE,
      label: 'In-Active',
      color: 'warning',
      count: getLengthByStatus(UserStatus.INACTIVE),
    },
  ] as const;

  const handleFilters = useCallback(
    (name: string, value: IAdvisorsTableFilterValue) => {
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

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteAdvisor(userId);
      enqueueSnackbar('Delete user success', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

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

        <AdvisorsTableToolbar filters={filters} onFilters={handleFilters} />

        {canReset && (
          <AdvisorsTableFiltersResult
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
                    <AdvisorTableRow
                      key={row.id}
                      row={row}
                      isLoading={advisors.isLoading}
                      authUser={authUser}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      handleDeleteUser={handleDeleteUser}
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
}: {
  inputData: AdvisorManager[];
  comparator: (a: any, b: any) => number;
  filters: IAdvisorsTableFilters;
}) {
  const { name, status } = filters;

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
        String(user?.name)
          .toLowerCase()
          .indexOf(name.toLowerCase()) !== -1 ||
        String(user?.email)
          .toLowerCase()
          .indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    // @ts-ignore
    inputData = inputData.filter((user) => user?.status === status);
  }

  return inputData;
}
