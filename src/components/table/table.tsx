import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import Scrollbar from 'components/Scrollbar';
import {
  useTable,
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from '.';
import { Box, Stack } from '@mui/material';

// ----------------------------------------------------------------------
type Props<T> = {
  tableHead: any[];
  defaultOrderBy?: string;
  tableData: T[];
  elementWrappers?: Record<keyof T, any>;
  isLoading?: boolean;
};

export default function CustomTable({
  tableHead = [],
  defaultOrderBy,
  tableData,
  elementWrappers,
}: Props<Record<string, any>>) {
  const table = useTable({
    defaultOrderBy,
  });

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const denseHeight = table.dense ? 34 : 34 + 20;

  const slicedData = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  return (
    <Box sx={{ height: 1 }}>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={tableHead}
              rowCount={dataFiltered.length}
              onSort={table.onSort}
            />

            <TableBody>
              {slicedData.map((row, index) => (
                <TableRow key={row?.id} hover>
                  {tableHead.map((key: any) => {
                    if (elementWrappers?.[key.id]) {
                      const wrapper = elementWrappers?.[key.id];

                      return <TableCell key={key?.id + row?.id}>{wrapper(row)}</TableCell>;
                    }

                    return (
                      <TableCell key={key?.id + row?.id}>{slicedData[index][key.id]}</TableCell>
                    );
                  })}
                </TableRow>
              ))}

              <TableEmptyRows
                height={denseHeight}
                emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
              />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      {dataFiltered.length !== 0 && (
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
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
}: {
  inputData: Record<string, any>[];
  comparator: (a: any, b: any) => number;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);

    if (order !== 0) return order;

    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  return inputData;
}
