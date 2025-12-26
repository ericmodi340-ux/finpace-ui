// @ts-ignore
import { UserRole } from '@types/user';
import { roles } from 'constants/users';
import { reinviteAdvisor } from 'redux/slices/advisors';
import { reinviteClient } from 'redux/slices/clients';
import { reinviteFirmAdmin } from 'redux/slices/firmAdmins';

export const resendInviteEmail = async (
  userId: string,
  role: UserRole.ADVISOR | UserRole.CLIENT | UserRole.FIRM_ADMIN,
  enqueueSnackbar: any
) => {
  try {
    switch (role) {
      case roles.ADVISOR:
        await reinviteAdvisor(userId);
        break;
      case roles.CLIENT:
        await reinviteClient(userId);
        break;
      case roles.FIRM_ADMIN:
        await reinviteFirmAdmin(userId);
        break;
      default:
        break;
    }
    enqueueSnackbar('Invite email resent!', { variant: 'success' });
  } catch (error) {
    console.error(error);
    enqueueSnackbar('Something went wrong', { variant: 'error' });
  }
};
