// @mui
import { Skeleton } from '@mui/material';
// @types
import { UserRole } from '../@types/user';
// hooks
import useStorageAvatar from 'hooks/useStorageAvatar';
// utils
import createAvatar from 'utils/createAvatar';
import { getImagePath } from 'utils/storage';
//
import Avatar, { Props as AvatarProps } from './Avatar';
import { useEffect } from 'react';
import useUser from 'hooks/useUser';
import { useSelector } from 'redux/store';

// ----------------------------------------------------------------------

interface Props extends AvatarProps {
  user: {
    type: UserRole;
    id: string | undefined;
    name: string | undefined;
  };
}

export default function UserAvatar({ user, ...other }: Props) {
  const { authUser } = useUser();
  const userId = authUser?.sub;
  const urlCache = useSelector((state) => state.storage.cache);

  const avatarPath = getImagePath({
    userType: user.type,
    userId: user.id,
    imageType: 'avatar',
  });
  const { loading, avatarUrl } = useStorageAvatar({
    path: avatarPath,
  });

  useEffect(() => {
    // If the user logs in and updates avatar image then should rerender
    if (user?.id === userId) {
      const _avatarPath = getImagePath({
        userType: user.type,
        userId: user.id,
        imageType: 'avatar',
      });
      if (_avatarPath && !avatarUrl) {
        // If path is already fetched return
        if (urlCache[_avatarPath]) {
          return;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return <Skeleton variant="circular" width={40} height={40} sx={{ ...other.sx }} />;
  }

  const initials = createAvatar(user.name || '').name;

  return (
    <Avatar
      src={!avatarUrl && !initials ? '' : avatarUrl}
      alt={user.name}
      color={avatarUrl ? 'default' : 'primary'}
      {...other}
    >
      {initials || null}
    </Avatar>
  );
}
