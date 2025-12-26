import { FirmAdminManager } from './firmAdmin';
import { AdvisorManager } from './advisor';
import { UserRole } from './user';

// ----------------------------------------------------------------------

export interface TeamMemberManager extends Omit<FirmAdminManager | AdvisorManager, 'id'> {
  id?: never;
  email: string;
  role: UserRole.FIRM_ADMIN | UserRole.ADVISOR | '';
}
