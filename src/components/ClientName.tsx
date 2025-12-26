import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link } from '@mui/material';
// @types
import { ClientManager } from '../@types/client';
import { UserRole } from '../@types/user';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// hooks
import useUserFromStore from 'hooks/useUserFromStore';
// utils
import { getClientCompositeName } from 'utils/clients';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

interface Props {
  clientId: string;
}

export default function ClientName({ clientId }: Props) {
  const client = useUserFromStore(clientId, roles.CLIENT as UserRole.CLIENT) as ClientManager;
  const listPage = PATH_DASHBOARD.clients.root;

  return (
    <Link
      to={`${listPage}/${clientId}`}
      color="inherit"
      variant="subtitle2"
      component={RouterLink}
      noWrap
    >
      {getClientCompositeName(client)}
    </Link>
  );
}
