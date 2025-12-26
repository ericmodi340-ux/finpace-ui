import { Link as RouterLink } from 'react-router-dom';

import TableRow from '@mui/material/TableRow';

import TableCell from '@mui/material/TableCell';

import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { fDate, fTime } from 'utils/formatTime';

import Label from 'components/Label';

import { FormManager } from '../../../@types/form';
import UserAvatar from 'components/UserAvatar';
import { UserRole } from '../../../@types/user';
import { FormMoreMenu } from '../form/list';
import { roles } from 'constants/users';
import { startCase } from 'lodash';
import { Tooltip } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  row: FormManager & {
    documentTypeName: string;
    advisorName: string;
    clientName: string;
  };
  selected: boolean;
  onSelectRow: VoidFunction;
  authUser: any;
  isLoading: boolean;
};

export default function FormsTableRow({ row, selected, authUser, isLoading }: Props) {
  const { clientName, advisorName, status, clientId, createdAt, dateSent, formTitle } = row;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <UserAvatar
            sx={{ mr: 2 }}
            user={{
              id: clientId,
              name: clientName,
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
                {clientName}
              </Typography>
            }
          />
        </TableCell>

        <TableCell>
          <Tooltip title={formTitle} placement="top">
            <Typography variant="body2">
              {formTitle?.length && formTitle?.length > 30
                ? formTitle?.substring(0, 30) + '...'
                : formTitle}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={fDate(createdAt)}
            secondary={fTime(createdAt)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={dateSent ? fDate(dateSent) : 'Not Yet Sent'}
            secondary={dateSent ? fTime(dateSent) : ''}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        {authUser?.role === roles.FIRM_ADMIN && <TableCell>{advisorName}</TableCell>}

        <TableCell>
          <Label
            variant="ghost"
            color={
              (status === 'completed' && 'success') ||
              (status === 'sent' && 'warning') ||
              (status === 'cancelled' && 'error') ||
              (status === 'draft' && 'info') ||
              'default'
            }
          >
            {startCase(status)}
          </Label>
        </TableCell>

        <TableCell align="center">
          <FormMoreMenu form={row} isLoading={isLoading} onFormCancel={() => {}} />
        </TableCell>
      </TableRow>
    </>
  );
}
