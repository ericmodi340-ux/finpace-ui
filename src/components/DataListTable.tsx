import { useState, useEffect, ReactNode } from 'react';
// @mui
import {
  DataGrid,
  GridRenderCellParams,
  GridFilterModel,
  GridFilterItem,
  GridColumnVisibilityModel,
  GridColumns,
  GridLinkOperator,
  GridRowId,
  GridValidRowModel,
  GridSortItem,
  GridSelectionModel,
  GridSortDirection,
} from '@mui/x-data-grid';
// components
import CustomDataGridToolbar from 'components/CustomDataGridToolbar';
import NoRowsOverlay from './NoRowsDatagrid';
import { SxProps } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  data: Array<{ [key: string]: any }>;
  columns: GridColumns;
  moreMenuRenderCell?: (params: GridRenderCellParams) => ReactNode;
  searchPlaceholder?: string;
  filterBy?: GridFilterItem[];
  hideColumns?: string[];
  pageSize?: number;
  loading?: boolean;
  filterNameId?: string;
  linkOperator?: GridLinkOperator;
  onFilter?: (filter: any) => any;
  getRowId?: (params: GridValidRowModel) => GridRowId;
  checkboxSelection?: boolean;
  onSelectionModelChange?: (params: GridSelectionModel) => void;
  initialSortModel?: GridSortItem[];
  disableColumnFilter?: boolean;
  sx?: SxProps;
  disableSelectionOnClick?: boolean;
  sortingOrder?: GridSortDirection[];
};

export default function DataListTable({
  data = [],
  columns = [],
  moreMenuRenderCell,
  filterBy = [],
  hideColumns = [],
  pageSize = 5,
  loading = false,
  checkboxSelection = false,
  getRowId,
  onSelectionModelChange = () => {},
  disableColumnFilter = false,
  initialSortModel = [],
  sx,
  disableSelectionOnClick = false,
  sortingOrder = ['asc', 'desc', null],
}: Props) {
  const [dataList, setDataList] = useState<Array<{ [key: string]: any }>>([]);
  const [tablePageSize, setTablePageSize] = useState(pageSize);
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: filterBy,
  });
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});

  useEffect(() => {
    let newDataList: Array<{ [key: string]: any }> = [];
    if (data) {
      newDataList = data;
    }
    if (newDataList) {
      setDataList(newDataList);
    }
  }, [data]);

  useEffect(() => {
    setColumnVisibilityModel((initialColumnVisibilityModel) => {
      let newColumnVisibilityModel = initialColumnVisibilityModel;

      hideColumns.forEach((columnId) => {
        newColumnVisibilityModel[columnId] = false;
      });

      return newColumnVisibilityModel;
    });
  }, [hideColumns]);

  return (
    <>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ width: '100%' }}>
          <DataGrid
            autoHeight
            rows={dataList}
            columns={[
              ...columns,
              ...(moreMenuRenderCell
                ? [
                    {
                      field: 'Actions',
                      headerName: '',
                      hideable: false,
                      sortable: false,
                      filterable: false,
                      maxWidth: 72,
                      disableColumnMenu: true,
                      disableExport: true,
                      renderCell: moreMenuRenderCell,
                    },
                  ]
                : []),
            ]}
            initialState={{
              columns: {
                columnVisibilityModel,
              },
              sorting: {
                sortModel: initialSortModel,
              },
            }}
            pagination
            pageSize={tablePageSize}
            onPageSizeChange={(newPageSize) => setTablePageSize(newPageSize)}
            rowsPerPageOptions={[5, 10, 25]}
            loading={loading}
            filterModel={filterModel}
            onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
            components={{
              Toolbar: disableColumnFilter ? () => <></> : CustomDataGridToolbar,
              NoRowsOverlay: () => NoRowsOverlay('No data available yet'),
              NoResultsOverlay: () => NoRowsOverlay('No data found'),
            }}
            getRowId={getRowId}
            checkboxSelection={checkboxSelection}
            disableColumnFilter={disableColumnFilter}
            onSelectionModelChange={onSelectionModelChange}
            disableSelectionOnClick={disableSelectionOnClick}
            sx={{ ...sx }}
            sortingOrder={sortingOrder}
          />
        </div>
      </div>
    </>
  );
}
