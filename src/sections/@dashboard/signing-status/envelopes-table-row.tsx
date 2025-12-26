import { Link as RouterLink } from 'react-router-dom';

import TableRow from '@mui/material/TableRow';

import TableCell from '@mui/material/TableCell';

import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { fDate, fTime } from 'utils/formatTime';

import Label from 'components/Label';

import { EnvelopeManager } from '../../../@types/envelope';
import { DeliveryMethodCell, RecipientsCell } from '../envelope/list/cells';
import { EnvelopeMoreMenu } from '../envelope/list';
import UserAvatar from 'components/UserAvatar';
import { UserRole } from '../../../@types/user';
import { roles } from 'constants/users';
import { Tooltip } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  row: EnvelopeManager & {
    documentTypeName: string;
  };
  selected: boolean;
  onSelectRow: VoidFunction;
  isLoading: boolean;
  authUser: any;
};

export default function EnvelopesTableRow({ row, selected, isLoading, authUser }: Props) {
  const {
    client,
    sentAt,
    advisor,
    status,
    deliveryMethod,
    documentTypeName,
    clientId,
    completedAt,
  } = row;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: 250,
          }}
        >
          <UserAvatar
            sx={{ mr: 2 }}
            user={{
              id: clientId,
              name: client?.name,
              type: UserRole.CLIENT,
            }}
          />

          <ListItemText
            primary={
              <Typography
                to={`/clients/${clientId}`}
                component={RouterLink}
                sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
                variant="body2"
                noWrap
              >
                {client?.name}
              </Typography>
            }
            secondary={
              <Tooltip title={client?.email}>
                <Typography noWrap variant="body2" sx={{ color: 'text.disabled' }}>
                  {client?.email}
                </Typography>
              </Tooltip>
            }
          />
        </TableCell>

        <TableCell>
          <Typography
            variant="body2"
            sx={{
              width: 135,
            }}
          >
            {documentTypeName}
          </Typography>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={sentAt ? fDate(sentAt) : ''}
            secondary={sentAt ? fTime(sentAt) : ''}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        {authUser?.role === roles.FIRM_ADMIN && (
          <TableCell>
            <Typography
              variant="body2"
              sx={{
                width: 125,
              }}
            >
              {advisor?.name}
            </Typography>
          </TableCell>
        )}

        <TableCell>
          <Label
            variant="ghost"
            sx={{
              textTransform: 'capitalize',
            }}
            color={
              (status === 'completed' && 'success') ||
              (status === 'sent' && 'warning') ||
              (status === 'cancelled' && 'error') ||
              'default'
            }
          >
            {status === 'cancelled' ? 'canceled' : status}
          </Label>
        </TableCell>

        <TableCell>
          <Typography
            variant="body2"
            sx={{
              width: 115,
            }}
          >
            <ListItemText
              primary={completedAt ? fDate(completedAt) : '---'}
              secondary={completedAt ? fTime(completedAt) : ''}
              primaryTypographyProps={{ typography: 'body2', noWrap: true }}
              secondaryTypographyProps={{
                mt: 0.5,
                component: 'span',
                typography: 'caption',
              }}
            />
          </Typography>
        </TableCell>

        <TableCell>
          <RecipientsCell envelope={row} />
        </TableCell>

        <TableCell>
          <DeliveryMethodCell deliveryMethod={deliveryMethod} />
        </TableCell>

        <TableCell align="center">
          <EnvelopeMoreMenu envelope={row} isLoading={isLoading} />
        </TableCell>
      </TableRow>
    </>
  );
}
