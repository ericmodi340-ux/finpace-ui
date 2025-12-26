// @types
import { AdvisorManager } from '../@types/advisor';
import { UserRole } from '../@types/user';
// hooks
import useUserFromStore from 'hooks/useUserFromStore';
// utils
import { getAdvisorName } from 'utils/advisors';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

interface Props {
  advisorId: string;
}

export default function AdvisorName({ advisorId }: Props) {
  const advisor = useUserFromStore(advisorId, roles.ADVISOR as UserRole.ADVISOR) as AdvisorManager;
  const advisorName = getAdvisorName(advisor) || 'No Advisor';
  return <>{advisorName}</>;
}
