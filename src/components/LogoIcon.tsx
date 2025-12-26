import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, BoxProps, Skeleton, Avatar } from '@mui/material';
import useStorage from 'hooks/useStorage';
// utils
import { useSelector } from 'redux/store';
import { WHITE_LABEL_ASSETS_PATHS } from 'utils/whiteLable';
import { getParams } from 'utils/params';
import { getLogoIcon } from 'utils/getLogo';
import useUser from 'hooks/useUser';
import { storagePaths } from 'redux/slices/storage';
import { UserRole } from '../@types/user';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  branded?: boolean;
  disabledLink?: boolean;
  width?: number | string;
  height?: number;
}

export default function LogoIcon({ disabledLink = false, width = 'auto', height = 45, sx }: Props) {
  const { firm } = useSelector((state) => state.firm);
  const { user, authUser } = useUser();

  // @ts-ignore
  const advisorId = authUser?.role === UserRole.CLIENT ? user?.advisorId : user?.id;

  const firmIconPath = storagePaths.firmIcon(
    firm.id || getParams().firmId || WHITE_LABEL_ASSETS_PATHS[window.location.host]?.firmId
  );
  const advisorIconPath = storagePaths.advisorIcon(
    firm.id || getParams().firmId || WHITE_LABEL_ASSETS_PATHS[window.location.host]?.firmId,
    advisorId || getParams().advisorId
  );

  const { url: advisorIconUrl, loading: advisorIcon } = useStorage({ path: advisorIconPath });

  const { url: firmIconUrl, loading: firmIcon } = useStorage({
    path: advisorIconUrl ? '' : firmIconPath,
  });

  const iconUrl = advisorIconUrl ? advisorIconUrl : firmIconUrl;

  const loading = advisorIcon || firmIcon;

  if (loading) {
    return <Skeleton variant="rectangular" width={width} height={height} />;
  }

  const logo = (
    <Box sx={{ width, height, ...sx }}>
      <img
        src={iconUrl ? iconUrl : getLogoIcon()}
        alt={iconUrl}
        color="default"
        style={{ width, height }}
      />
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return (
    <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      {logo}
    </RouterLink>
  );
}
