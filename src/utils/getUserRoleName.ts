import { titleCase } from './strings';
import { roles } from 'constants/users';
// @types
import { AdvisorManager } from '../@types/advisor';
import { ClientManager } from '../@types/client';
import { FirmAdminManager } from '../@types/firmAdmin';

// ----------------------------------------------------------------------

export default function getUserRoleName(
  role: string,
  user?: Partial<AdvisorManager | ClientManager | FirmAdminManager> | null | undefined
) {
  if (!role) {
    return '';
  }

  let roleName;

  switch (role) {
    case roles.CLIENT:
      roleName = (user as ClientManager)?.isProspect ? 'Prospect' : titleCase(role);
      break;
    case roles.FIRM_ADMIN:
      roleName = 'Firm Admin';
      break;
    default:
      roleName = titleCase(role);
  }

  return roleName;
}
