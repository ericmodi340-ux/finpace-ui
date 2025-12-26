// @mui
import { Skeleton } from '@mui/material';
// hooks
import useUser from 'hooks/useUser';
// components
import { Props as AvatarProps } from './Avatar';
import UserAvatar from './UserAvatar';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }: AvatarProps) {
  const { authUser, user } = useUser();

  if (!user) {
    return <Skeleton variant="circular" width={40} height={40} sx={{ ...other.sx }} />;
  }

  return (
    <UserAvatar
      user={{ type: authUser?.role, id: user?.id, name: user?.name }}
      sx={{ ...other.sx }}
    />
  );
}
