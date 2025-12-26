// @mui
import {
  Box,
  Card,
  Stack,
  Tooltip,
  Typography,
  CardHeader,
  IconButton,
  TablePagination,
} from '@mui/material';
import { UserRole } from '../../../@types/user';
import Iconify from 'components/Iconify';
import { toArray } from 'lodash';
import { useSelector } from 'redux/store';
import { StyledBadge } from '../user/list/cells/NameCell';
import UserAvatar from 'components/UserAvatar';
import { PATH_DASHBOARD } from 'routes/paths';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getClientCompositeName } from 'utils/clients';
import useAdvisorTasks from 'hooks/useAdvisorTasks';

// ----------------------------------------------------------------------

export default function AdvisorTasks() {
  const clientsFromState = useSelector((state) => state.clients.byId);
  const clients = toArray(clientsFromState);
  const { byId: formsById } = useSelector((state) => state.forms);
  const { byId: templatesById } = useSelector((state) => state.templates);
  const navigate = useNavigate();

  const {
    formsList,
    formsAwaitingAdvisorReview,
    cardsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
    page,
  } = useAdvisorTasks(formsById);

  return (
    <Card sx={{ minHeight: '543px' }}>
      <CardHeader
        title="Advisor Tasks"
        action={
          <Tooltip title="Add Client">
            <RouterLink to={PATH_DASHBOARD.clients.new}>
              <IconButton color="primary" size="large">
                <Iconify icon={'eva:plus-fill'} width={20} height={20} />
              </IconButton>
            </RouterLink>
          </Tooltip>
        }
      />

      <Stack direction="column" spacing={3} sx={{ p: 3, my: 1.5 }}>
        {formsList.map((form) => {
          const client = clients.find((client) => client.id === form.clientId);
          const template = templatesById[form.templateId];

          return (
            <Stack direction="row" alignItems="center" key={form.id}>
              <StyledBadge
                color="error"
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                variant="dot"
              >
                <UserAvatar
                  user={{
                    type: UserRole.CLIENT,
                    id: form.clientId,
                    name: form.clientId,
                  }}
                  sx={{ mr: 2 }}
                />
              </StyledBadge>
              <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                <Typography variant="subtitle2" className="name" sx={{ mb: 0.5 }} noWrap>
                  {client && getClientCompositeName(client)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  Fill form {template?.title || ''}
                </Typography>
              </Box>
              <Tooltip title="Go to task">
                <IconButton
                  size="small"
                  onClick={() => navigate(`${PATH_DASHBOARD.forms.root}/${form.id}`)}
                >
                  <Iconify icon={'eva:diagonal-arrow-right-up-fill'} width={22} height={22} />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        })}

        {formsAwaitingAdvisorReview?.length < 5 && <Box sx={{ flex: 1 }} />}

        <TablePagination
          rowsPerPage={cardsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={formsAwaitingAdvisorReview.length}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Stack>
    </Card>
  );
}
