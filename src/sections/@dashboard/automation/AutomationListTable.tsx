// @mui
import { Typography } from '@mui/material';
import { GridRenderCellParams, GridFilterItem } from '@mui/x-data-grid';
// redux
import { dispatch, useSelector } from 'redux/store';
// components
import DataListTable from 'components/DataListTable';
import DateComponent from 'components/DateComponent';
// constants
import { AutomationConfig, AutomationStatus } from '../../../@types/automation';
import StatusCell from './StatusCell';
import AutomationMoreMenu from './AutomationMoreMenu';
import { useEffect } from 'react';
import { getAutomations } from 'redux/slices/automations';
import { AnyAction } from 'redux';

// ----------------------------------------------------------------------

type Props = {
  status?: AutomationStatus[];
  filterBy?: GridFilterItem[];
  hideColumns?: string[];
};

export default function AutomationListTable({ status, filterBy = [], hideColumns = [] }: Props) {
  const { automations, isLoading } = useSelector((state) => state.automations);

  useEffect(() => {
    dispatch(getAutomations() as unknown as AnyAction);
  }, []);

  const TABLE_COLUMNS = [
    {
      field: 'type',
      headerName: 'Automation Type',
      hideable: false,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => <AutomationTypeCell data={params.row} />,
    },
    {
      field: 'startedAt',
      headerName: 'Date Started',
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => <DateComponent date={params.value} />,
    },
    {
      field: 'submitterName',
      headerName: 'Started by',
      minWidth: 200,
      //   renderCell: (params: GridRenderCellParams) => <TemplateName templateId={params.value} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => <StatusCell automation={params.row} />,
    },
    {
      field: 'id',
      headerName: 'Automation ID',
    },
  ];

  return (
    <DataListTable
      data={automations.map((item) => ({
        ...item,
      }))}
      columns={TABLE_COLUMNS}
      moreMenuRenderCell={(params: GridRenderCellParams) => (
        <AutomationMoreMenu automation={params.row} isLoading={isLoading} />
      )}
      filterBy={[
        ...filterBy,
        ...(status && status.length
          ? [
              {
                id: 'status',
                columnField: 'status',
                operatorValue: 'isAnyOf',
                value: status,
              },
            ]
          : []),
      ]}
      hideColumns={['id', ...hideColumns]}
      searchPlaceholder={`Search Automation...`}
      loading={isLoading}
      initialSortModel={[
        {
          field: 'startedAt',
          sort: 'desc',
        },
      ]}
    />
  );
}

const AutomationTypeCell = ({ data }: { data: AutomationConfig }) => (
  <>
    <Typography textTransform={'capitalize'}>
      {data.type === 'import' ? `Imported Clients from ${data?.integration || 'CSV'}` : data.type}
    </Typography>
  </>
);
