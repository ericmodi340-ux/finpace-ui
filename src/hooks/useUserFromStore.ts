import { useSelector } from 'redux/store';
import { roles } from 'constants/users';
import { UserRole } from '../@types/user';

// ----------------------------------------------------------------------

const useUserFromStore = (userId: string | undefined, role: UserRole) => {
  let storeRole: UserRole.ADVISOR | UserRole.CLIENT;
  let storeRoleMany: UserRole.ADVISOR | UserRole.CLIENT | 'firmAdmins';
  switch (role) {
    case roles.ADVISOR:
      storeRole = roles.ADVISOR as UserRole.ADVISOR;
      storeRoleMany = `${roles.ADVISOR}s` as UserRole.ADVISOR;
      break;
    case roles.CLIENT:
      storeRole = roles.CLIENT as UserRole.CLIENT;
      storeRoleMany = `${roles.CLIENT}s` as UserRole.CLIENT;
      break;
    case roles.FIRM_ADMIN:
      storeRoleMany = 'firmAdmins';
      break;
  }
  // @ts-ignore
  const user = useSelector((state) => state[`${storeRole}`]);
  const users = useSelector((state) => state[`${storeRoleMany}`]);

  if (!userId) {
    return;
  }

  // Return for users that don't get all of the requested roles, like logged-in clients will only fetch their assigned advisor (not all advisors)
  // @ts-ignore
  if (role === roles.FIRM_ADMIN) {
    // @ts-ignore
    return users.byId[userId];
  }

  //@ts-ignore
  const individualUser = user[storeRole];
  if (individualUser && individualUser.id === userId) {
    return individualUser;
  }

  // @ts-ignore
  return users.byId[userId];
};

export default useUserFromStore;
