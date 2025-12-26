import { UserRole } from '../@types/user';

// ----------------------------------------------------------------------

export function getImagePath({
  userType,
  userId,
  imageType,
}: {
  userType: 'firm' | UserRole | null | undefined;
  userId: string | undefined;
  imageType: 'avatar' | 'icon' | 'logo' | string;
}) {
  if (!userType || !userId) {
    return;
  }
  return `${userType}s/${userId}/images/${imageType}`;
}
