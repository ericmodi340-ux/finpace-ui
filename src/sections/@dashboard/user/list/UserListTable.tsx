import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { GridRenderCellParams, GridFilterItem } from '@mui/x-data-grid';
// redux
import { useSelector } from 'redux/store';
import { deleteAdvisor } from 'redux/slices/advisors';
import { deleteClient } from 'redux/slices/clients';
import { deleteFirmAdmin } from 'redux/slices/firmAdmins';
// @types
import { AdvisorManager, AdvisorsState } from '../../../../@types/advisor';
import { ClientManager, ClientsState } from '../../../../@types/client';
import { FirmAdminManager, FirmAdminsState } from '../../../../@types/firmAdmin';
import { UserRole } from '../../../../@types/user';
// components
import AdvisorName from 'components/AdvisorName';
import DataListTable from 'components/DataListTable';
import DateComponent from 'components/DateComponent';
// sections
import { UserMoreMenu } from '.';
import { NameCell, StatusCell } from './cells';
// hooks
import useUser from 'hooks/useUser';
// utils
import arrayFromObj from 'utils/arrayFromObj';
import { resendInviteEmail } from 'utils/mail';
// constants
import { roles, statuses } from 'constants/users';
import useQuickFilters from 'hooks/useQuickFilters';

// ----------------------------------------------------------------------

type Props = {
  type: UserRole.ADVISOR | UserRole.CLIENT | UserRole.FIRM_ADMIN;
  isProspect?: boolean;
  filterBy?: GridFilterItem[];
  hideColumns?: string[];
  pageSize?: number;
};

export default function UserListTable({
  type,
  isProspect = false,
  filterBy = [],
  hideColumns = [],
  pageSize,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();

  const advisors = useSelector((state) => state.advisors) as AdvisorsState;
  const clients = useSelector((state) => state.clients) as ClientsState;
  const firmAdmins = useSelector((state) => state.firmAdmins) as FirmAdminsState;
  const { applyFilterByAdvisor } = useQuickFilters();

  const [userList, setUserList] = useState<
    Array<AdvisorManager | ClientManager | FirmAdminManager>
  >([]);

  useEffect(() => {
    let newUserList: Array<AdvisorManager | ClientManager | FirmAdminManager> = [];
    switch (type) {
      case roles.ADVISOR:
        const advisorsArray = arrayFromObj(advisors.byId, advisors.allIds) as AdvisorManager[];
        newUserList = advisorsArray.filter(
          (advisor) =>
            !advisor.isFirmAdmin || (advisor.isFirmAdmin && advisor.status !== statuses.INACTIVE)
        );
        break;
      case roles.CLIENT:
        const clientsArray = arrayFromObj(clients.byId, clients.allIds) as ClientManager[];
        if (isProspect) {
          newUserList = clientsArray.filter((client) => client.isProspect);
        } else {
          newUserList = clientsArray.filter((client) => !client.isProspect);
        }
        break;
      case roles.FIRM_ADMIN:
        newUserList = arrayFromObj(firmAdmins.byId, firmAdmins.allIds) as FirmAdminManager[];
        break;
      default:
        break;
    }

    if (newUserList) {
      setUserList(
        newUserList.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
      );
    }
  }, [type, clients, advisors, firmAdmins, isProspect]);

  const handleDeleteUser = async (userId: string) => {
    try {
      switch (type) {
        case roles.ADVISOR:
          await deleteAdvisor(userId);
          break;
        case roles.CLIENT:
          await deleteClient(userId);
          break;
        case roles.FIRM_ADMIN:
          await deleteFirmAdmin(userId);
          break;
        default:
          break;
      }
      enqueueSnackbar('Delete user success', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  function getApplyFilterByName(value: any) {
    return (params: any) => {
      const name = params.row?.name || '';

      return name.toLowerCase().includes(value.toLowerCase());
    };
  }

  const TABLE_COLUMNS = {
    [roles.ADVISOR]: [
      {
        field: 'name',
        headerName: 'Name',
        hideable: false,
        flex: 1,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
          <NameCell user={params.row} type={roles.ADVISOR as UserRole.ADVISOR} />
        ),
        getApplyQuickFilterFn: getApplyFilterByName,
      },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
      {
        field: 'status',
        headerName: 'Status',
        renderCell: (params: GridRenderCellParams) => <StatusCell status={params.value} />,
      },
    ],
    [roles.CLIENT]: [
      {
        field: 'name',
        headerName: 'Name',
        hideable: false,
        flex: 1,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
          <NameCell
            user={params.row}
            type={roles.CLIENT as UserRole.CLIENT}
            isProspect={Boolean(params.row.isProspect)}
          />
        ),
        getApplyQuickFilterFn: getApplyFilterByName,
      },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
      {
        field: 'advisorId',
        headerName: 'Advisor',
        flex: 0.6,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams) => <AdvisorName advisorId={params.value} />,
        getApplyQuickFilterFn: applyFilterByAdvisor,
      },

      {
        field: 'createdAt',
        headerName: 'Created Date',
        flex: 0.6,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams) => <DateComponent date={params.row.createdAt} />,
      },
      {
        field: 'status',
        headerName: 'Status',
        renderCell: (params: GridRenderCellParams) => <StatusCell status={params.value} />,
      },
    ],
    [roles.FIRM_ADMIN]: [
      {
        field: 'name',
        headerName: 'Name',
        hideable: false,
        flex: 1,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
          <NameCell user={params.row} type={roles.FIRM_ADMIN as UserRole.FIRM_ADMIN} />
        ),
        getApplyQuickFilterFn: getApplyFilterByName,
      },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
      {
        field: 'status',
        headerName: 'Status',
        renderCell: (params: GridRenderCellParams) => <StatusCell status={params.value} />,
      },
    ],
  };

  const typeName = isProspect ? 'prospect' : type;

  return (
    <DataListTable
      filterBy={filterBy}
      data={userList}
      columns={TABLE_COLUMNS[type]}
      moreMenuRenderCell={(params: GridRenderCellParams) => (
        <UserMoreMenu
          onDelete={
            params.row.id === user?.id || (type === roles.ADVISOR && params.row.isFirmAdmin)
              ? undefined
              : () => handleDeleteUser(params.row.id)
          }
          onResendVerifyEmail={
            !params.row.isVerified
              ? () => resendInviteEmail(params.row.id, type, enqueueSnackbar)
              : undefined
          }
          editLink={`/${typeName}s/${params.id}`}
        />
      )}
      searchPlaceholder={`Search ${typeName.replace('-', ' ')}s...`}
      initialSortModel={[
        {
          field: 'createdAt',
          sort: 'desc',
        },
      ]}
      sortingOrder={['desc', 'asc']}
      hideColumns={[...hideColumns, 'createdAt']}
      pageSize={pageSize}
    />
  );
}
