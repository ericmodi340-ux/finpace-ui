import { Link as RouterLink } from 'react-router-dom';

import TableRow from '@mui/material/TableRow';

import TableCell from '@mui/material/TableCell';

import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import Label from 'components/Label';

import UserAvatar from 'components/UserAvatar';
import { UserRole, UserStatus } from '../../../@types/user';
import { UserMoreMenu } from '../user/list';
import { resendInviteEmail } from 'utils/mail';
import { useSnackbar } from 'notistack';
import { AdvisorManager } from '../../../@types/advisor';
import { Tooltip, Stack } from '@mui/material';
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

type Props = {
  row: AdvisorManager;
  selected: boolean;
  onSelectRow: VoidFunction;
  isLoading: boolean;
  authUser: any;
  handleDeleteUser: (id: string) => void;
};

export default function AdvisorTableRow({ row, selected, authUser, handleDeleteUser }: Props) {
  const { name, email, status, id, isFirmAdmin } = row;

  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <RouterLink
            style={{
              textDecoration: 'none',
            }}
            to={`/advisors/${id}`}
          >
            <UserAvatar
              sx={{ mr: 2 }}
              user={{
                id: id,
                name: name,
                type: UserRole.ADVISOR,
              }}
            />
          </RouterLink>

          <ListItemText
            primary={
              <Stack flexDirection="row" alignItems="center">
                <Typography
                  to={`/advisors/${id}`}
                  component={RouterLink}
                  sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
                  variant="body2"
                  noWrap
                >
                  {name}
                </Typography>
                {isFirmAdmin && (
                  <Tooltip title="User is also a Firm Admin">
                    <span>
                      <Iconify ml={0.5} icon="mdi:crown" />
                    </span>
                  </Tooltip>
                )}
              </Stack>
            }
          />
        </TableCell>

        <TableCell>{email}</TableCell>

        <TableCell>
          <Label
            sx={{ textTransform: 'capitalize' }}
            variant="ghost"
            color={status === UserStatus.ACTIVE ? 'success' : 'warning'}
          >
            {status}
          </Label>
        </TableCell>

        <TableCell align="center">
          <UserMoreMenu
            onDelete={() => handleDeleteUser(id)}
            onResendVerifyEmail={
              !row.isVerified
                ? () => resendInviteEmail(id, UserRole.CLIENT, enqueueSnackbar)
                : undefined
            }
            editLink={`/advisors/${id}`}
            disableDelete={isFirmAdmin}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
