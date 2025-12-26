import { Link as RouterLink } from 'react-router-dom';

import TableRow, { tableRowClasses } from '@mui/material/TableRow';

import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import Label from 'components/Label';

import UserAvatar from 'components/UserAvatar';
import { UserRole, UserStatus } from '../../../@types/user';
import { roles } from 'constants/users';
import { ClientManager } from '../../../@types/client';
import { UserMoreMenu } from '../user/list';
import { resendInviteEmail } from 'utils/mail';
import { useSnackbar } from 'notistack';
import { alpha, Stack, useTheme, Checkbox, styled, Badge } from '@mui/material';
import { useBoolean } from 'hooks/useBoolean';
import Tooltip from '@mui/material/Tooltip';
import { useSelector } from 'redux/store';
import useAdvisorTasks from 'hooks/useAdvisorTasks';
import { BadgeProps } from '@arco-design/web-react';

// ----------------------------------------------------------------------

type Props = {
  row: ClientManager & {
    clientType?: string;
    advisorName?: string;
  };
  selected: boolean;
  onSelectRow: VoidFunction;
  isLoading: boolean;
  authUser: any;
  handleDeleteUser: (id: string) => void;
};

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: 'linear-gradient(60deg, #F90F90 0%, #D40005 100%)',
  },
}));

export default function ClientTableRow({
  row,
  selected,
  authUser,
  handleDeleteUser,
  onSelectRow,
}: Props) {
  const { name, email, advisorName, clientType, status, id, firstName, lastName, createdAt } = row;

  const { byId: formsById } = useSelector((state) => state.forms);

  const { formsAwaitingAdvisorReview } = useAdvisorTasks(formsById, 6, id);

  const theme = useTheme();

  const details = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const defaultStyles = {
    backgroundColor: theme.palette.background.default,
    borderTop: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    '&:first-of-type': {
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      borderLeft: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
    '&:last-of-type': {
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      borderRight: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
  };

  const isNew =
    createdAt && new Date().getTime() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;

  const showBadge = isNew
    ? !!formsAwaitingAdvisorReview.length
      ? formsAwaitingAdvisorReview.length
      : '1'
    : formsAwaitingAdvisorReview.length;

  return (
    <>
      <TableRow
        selected={selected}
        sx={{
          borderRadius: 2,
          [`&.${tableRowClasses.selected}, &:hover`]: {
            backgroundColor: 'background.paper',
            boxShadow: theme.customShadows.z20,
            transition: theme.transitions.create(['background-color', 'box-shadow'], {
              duration: theme.transitions.duration.shortest,
            }),
            '&:hover': {
              backgroundColor: 'background.paper',
              boxShadow: theme.customShadows.z20,
            },
          },
          [`& .${tableCellClasses.root}`]: {
            ...defaultStyles,
          },
          ...(details.value && {
            [`& .${tableCellClasses.root}`]: {
              ...defaultStyles,
            },
          }),
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onDoubleClick={() => console.info('ON DOUBLE CLICK')}
            onClick={onSelectRow}
          />
        </TableCell>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <span
              style={{
                marginRight: '8px',
              }}
            >
              <StyledBadge badgeContent={showBadge} color="error">
                <UserAvatar
                  user={{
                    id: id,
                    name: name,
                    type: UserRole.CLIENT,
                  }}
                />
              </StyledBadge>
            </span>

            <ListItemText
              primary={
                <Typography
                  to={`/${clientType}s/${id}`}
                  component={RouterLink}
                  sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
                  variant="body2"
                  noWrap
                >
                  {name || `${firstName} ${lastName}`}
                </Typography>
              }
              secondary={
                <Typography
                  to={`/${clientType}s/${id}`}
                  component={RouterLink}
                  noWrap
                  variant="body2"
                  sx={{ color: 'text.disabled', display: 'block' }}
                >
                  {email}
                </Typography>
              }
            />
          </Stack>
        </TableCell>

        {authUser?.role === roles.FIRM_ADMIN && <TableCell>{advisorName}</TableCell>}

        <TableCell>
          <Label
            sx={{ textTransform: 'capitalize' }}
            variant="ghost"
            color={clientType === 'client' ? 'success' : 'warning'}
          >
            {clientType}
          </Label>
        </TableCell>

        <TableCell>
          <Label
            sx={{ textTransform: 'capitalize' }}
            variant="ghost"
            color={status === UserStatus.ACTIVE ? 'primary' : 'error'}
          >
            {status}
          </Label>
        </TableCell>

        <TableCell>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {row.tags?.slice(0, 3).map((tag) => (
              <Label key={tag} variant="filled" color="info">
                {tag}
              </Label>
            ))}
            {row.tags && row.tags.length > 3 && (
              <Tooltip title={row.tags.join(', ')}>
                <span>
                  <Label variant="filled" color="default" sx={{ cursor: 'pointer' }}>
                    +{row.tags.length - 3} more
                  </Label>
                </span>
              </Tooltip>
            )}
          </Stack>
        </TableCell>

        <TableCell align="center">
          <UserMoreMenu
            onDelete={() => handleDeleteUser(id)}
            onResendVerifyEmail={
              !row.isVerified
                ? () => resendInviteEmail(id, UserRole.CLIENT, enqueueSnackbar)
                : undefined
            }
            editLink={`/${row.isProspect ? 'prospect' : 'client'}s/${id}`}
            clientId={row.id}
            userType="client"
          />
        </TableCell>
      </TableRow>
    </>
  );
}
