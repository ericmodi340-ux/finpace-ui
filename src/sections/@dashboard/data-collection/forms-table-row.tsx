import { Link as RouterLink } from 'react-router-dom';

import TableRow from '@mui/material/TableRow';

import TableCell from '@mui/material/TableCell';

import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { fDate, fTime } from 'utils/formatTime';

import { Button, IconButton } from '@mui/material';
import { PATH_DASHBOARD } from 'routes/paths';
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  selected: boolean;
};

export default function FormsTableRow({ row, selected }: Props) {
  // id: '1', formTitle: 'Form 1', createdAt: '2021-01-01', responses: 0 }];
  const { id, formTitle, createdAt } = row;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemText
            primary={
              <Typography
                to={PATH_DASHBOARD.dataCollection.formBuilder(id)}
                component={RouterLink}
                sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
                variant="body2"
                noWrap
              >
                {formTitle}
              </Typography>
            }
            secondary="Default PDF"
          />
        </TableCell>

        <TableCell>
          <ListItemText primary={fDate(createdAt)} secondary={fTime(createdAt)} />
        </TableCell>

        <TableCell>
          <Button variant="outlined" color="primary">
            Responses
          </Button>
        </TableCell>

        <TableCell>
          <IconButton>
            <Iconify icon="ion:open-outline" />
          </IconButton>
        </TableCell>

        <TableCell align="center">
          <IconButton>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>
    </>
  );
}
