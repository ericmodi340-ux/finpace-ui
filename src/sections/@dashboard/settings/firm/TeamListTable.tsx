import { useSnackbar } from 'notistack';
// @mui
import { GridRenderCellParams } from '@mui/x-data-grid';
// redux
import { useSelector } from 'redux/store';
import { deleteAdvisor } from 'redux/slices/advisors';
import { deleteFirmAdmin } from 'redux/slices/firmAdmins';
// @types
import { AdvisorManager } from '../../../../@types/advisor';
import { FirmAdminManager } from '../../../../@types/firmAdmin';
import { UserRole } from '../../../../@types/user';
// components
import DataListTable from 'components/DataListTable';
// sections
import { UserMoreMenu } from 'sections/@dashboard/user/list';
import { NameCell, StatusCell } from 'sections/@dashboard/user/list/cells';
// hooks
import useUser from 'hooks/useUser';
// utils
import arrayFromObj from 'utils/arrayFromObj';
import getUserRoleName from 'utils/getUserRoleName';
import { resendInviteEmail } from 'utils/mail';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

const TABLE_COLUMNS = [
  {
    field: 'name',
    headerName: 'Name',
    hideable: false,
    flex: 1,
    minWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <NameCell user={params.row} type={params.row.role as UserRole} />
    ),
  },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
  {
    field: 'role',
    headerName: 'Role',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => <>{getUserRoleName(params.value)}</>,
  },
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (params: GridRenderCellParams) => <StatusCell status={params.value} />,
  },
];

// ----------------------------------------------------------------------

export default function TeamListTable() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();

  const firmAdmins = useSelector((state) => state.firmAdmins);
  const advisors = useSelector((state) => state.advisors);
  const advisorsArray = arrayFromObj(advisors.byId, advisors.allIds) as AdvisorManager[];
  const firmAdminsArray = arrayFromObj(firmAdmins.byId, firmAdmins.allIds) as FirmAdminManager[];

  const teamArray = [
    ...advisorsArray.map((advisor) => ({ ...advisor, role: roles.ADVISOR })),
    ...firmAdminsArray.map((firmAdmin) => ({ ...firmAdmin, role: roles.FIRM_ADMIN })),
  ].sort(
    (a: AdvisorManager | FirmAdminManager, b: AdvisorManager | FirmAdminManager) =>
      a.name?.localeCompare(b.name)
  );

  const handleDeleteUser = async (userId: string, role: UserRole.ADVISOR | UserRole.FIRM_ADMIN) => {
    try {
      switch (role) {
        case roles.ADVISOR:
          await deleteAdvisor(userId);
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

  return (
    <DataListTable
      data={teamArray.flatMap((teamMember) => {
        // Don't duplicate advisors that are firm admins in list (firm admins who are advisors will have both advisor & firm admin db entries)
        if (teamMember.role === roles.ADVISOR) {
          const advisorTeamMember = teamMember as AdvisorManager;
          if (advisorTeamMember.isFirmAdmin) {
            return [];
          }
        }

        return [
          {
            ...teamMember,
            id: teamMember.id,
          },
        ];
      })}
      columns={TABLE_COLUMNS}
      moreMenuRenderCell={(params: GridRenderCellParams) => (
        <UserMoreMenu
          onDelete={
            params.row.id === user?.id
              ? undefined
              : () => handleDeleteUser(params.row.id, params.row.role)
          }
          onResendVerifyEmail={
            params.row.isVerified
              ? undefined
              : () => resendInviteEmail(params.row.id, params.row.role, enqueueSnackbar)
          }
          editLink={`/${params.row.role}s/${params.id}`}
        />
      )}
      searchPlaceholder={`Search team members...`}
      loading={advisors.isLoading || firmAdmins.isLoading}
    />
  );
}
