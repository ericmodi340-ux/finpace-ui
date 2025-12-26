// @mui
import { useTheme } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
import { useSelector } from 'redux/store';
import { toArray } from 'lodash';
import { GridRenderCellParams } from '@mui/x-data-grid';
import DataListTable from 'components/DataListTable';
import { NameCell } from '../user/list/cells';
import { roles } from 'constants/users';
import { UserRole } from '../../../@types/user';
import Label from 'components/Label';
import { calculateAdvisorData, getAdvisorName } from 'utils/advisors';

// ----------------------------------------------------------------------

export default function AdvisorGrowth() {
  const theme = useTheme();
  const { byId } = useSelector((state) => state.advisors);
  const { byId: clientsIds } = useSelector((state) => state.clients);
  const advisorArray = toArray(byId);
  const clientsArray = toArray(clientsIds);

  const newData = calculateAdvisorData(advisorArray, clientsArray);

  const TABLE_COLUMNS = [
    {
      field: 'id',
      headerName: 'Advisor',
      flex: 0.6,
      minWidth: 150,
      valueGetter: (params: any) => getAdvisorName(params.row),
      renderCell: (params: GridRenderCellParams) => (
        <NameCell
          user={params.row}
          type={roles.ADVISOR as UserRole.ADVISOR}
          isProspect={Boolean(params.row.isProspect)}
        />
      ),
    },
    {
      field: 'newAccounts',
      headerName: 'New Acconts',
      flex: 0.6,
    },
    {
      field: 'accountsLastYear',
      headerName: 'Accounts Last Year',
      flex: 0.6,
      hide: true,
    },
    {
      field: 'yoyGrowth',
      headerName: 'YoY Growth',
      flex: 0.6,
      renderCell: (params: GridRenderCellParams) => {
        if (params.value === 0) return '0 %';
        return `${params.value} % (${params.row.accountsLastYear})`;
      },
    },
    {
      field: 'assets',
      headerName: 'Assets',
      flex: 0.6,
    },
    {
      field: 'rank',
      headerName: 'Rank',
      sortable: false,
      renderCell: (params: any) => {
        const sortingModel = params.api.getSortModel()[0];
        const field = sortingModel ? sortingModel.field : null;
        const direction = sortingModel ? sortingModel.sort : null;

        if (field === 'id') {
          return (
            <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'} color={'info'}>
              Advisor
            </Label>
          );
        }

        // Sort the rows based on the sorting column and direction
        let sortedRows = params.api.getSortedRows({
          sortModel: [
            {
              field,
              sort: direction,
            },
          ],
        });

        // Find the current row's index in the sorted rows
        const sortedIndex = sortedRows.indexOf(params.row);

        const rank = direction === 'desc' ? sortedIndex + 1 : sortedRows.length - sortedIndex;

        return (
          <Label
            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
            color={rank <= 3 ? 'primary' : 'warning'}
          >
            Top {rank}
          </Label>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader title="Advisor Growth" sx={{ mb: 3 }} />
      <DataListTable
        data={newData}
        columns={TABLE_COLUMNS}
        hideColumns={['accountsLastYear']}
        searchPlaceholder={`Search...`}
        disableColumnFilter={true}
        initialSortModel={[
          {
            field: 'newAccounts',
            sort: 'desc',
          },
        ]}
        pageSize={5}
        sortingOrder={['desc', 'asc']}
      />
    </Card>
  );
}
