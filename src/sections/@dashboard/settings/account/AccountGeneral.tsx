// hooks
import useAuth from 'hooks/useAuth';
// constants
import { roles } from 'constants/users';
//
import { AccountGeneralClient } from '.';
import { FirmAdminGeneral } from 'sections/@dashboard/firm-admin/profile';
import useUser from 'hooks/useUser';
import { FirmAdminManager } from '../../../../@types/firmAdmin';
import { AdvisorGeneral } from 'sections/@dashboard/advisor/profile';
import { AdvisorManager } from '../../../../@types/advisor';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { user } = useAuth();
  const { user: dbUser } = useUser();

  if (!dbUser) return null;

  switch (user?.role) {
    case roles.ADVISOR:
      return (
        <AdvisorGeneral
          isEdit
          currentAdvisor={dbUser as AdvisorManager}
          advisorId={dbUser?.id || ''}
        />
      );
    case roles.CLIENT:
      return <AccountGeneralClient />;
    case roles.FIRM_ADMIN:
      return (
        <FirmAdminGeneral
          isEdit
          currentFirmAdmin={dbUser as FirmAdminManager}
          firmAdminId={dbUser?.id || ''}
        />
      );
    default:
      return <></>;
  }
}
