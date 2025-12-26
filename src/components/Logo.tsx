import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, BoxProps, Typography, Skeleton } from '@mui/material';
import useStorage from 'hooks/useStorage';
// utils
import { useSelector } from 'redux/store';
import { WHITE_LABEL_ASSETS_PATHS } from 'utils/whiteLable';
import { getParams } from 'utils/params';
import { getFullLogo } from 'utils/getLogo';
import useUser from 'hooks/useUser';
import { storagePaths } from 'redux/slices/storage';
import { UserRole } from '../@types/user';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  branded?: boolean;
  disabledLink?: boolean;
  width?: number;
  height?: number;
}

export default function Logo({ disabledLink = false, width = 174, height = 76, sx }: Props) {
  const { firm } = useSelector((state) => state.firm);
  const { user, authUser } = useUser();

  // @ts-ignore
  const advisorId = authUser?.role === UserRole.CLIENT ? user?.advisorId : user?.id;

  const firmLogoPath = storagePaths.firmLogo(
    firm.id || getParams().firmId || WHITE_LABEL_ASSETS_PATHS[window.location.host]?.firmId
  );
  const advisorLogoPath = storagePaths.advisorLogo(
    firm.id || getParams().firmId || WHITE_LABEL_ASSETS_PATHS[window.location.host]?.firmId,
    advisorId || getParams().advisorId
  );

  const { url: advisorLogoUrl, loading: advisorLogo } = useStorage({ path: advisorLogoPath });

  const { url: firmLogoUrl, loading: firmLogo } = useStorage({
    path: advisorLogoUrl ? '' : firmLogoPath,
  });

  const logoUrl = advisorLogoUrl ? advisorLogoUrl : firmLogoUrl;

  const loading = advisorLogo || firmLogo;

  if (loading) {
    return <Skeleton variant="rectangular" width={width} height={height} />;
  }

  const logo = (
    <>
      {!logoUrl ? (
        <Box sx={{ ...sx }}>
          <Typography variant="h4">Finpace</Typography>
        </Box>
      ) : (
        <Box sx={{ width, height, ...sx }}>
          <img
            src={logoUrl ? logoUrl : getFullLogo()}
            alt={logoUrl}
            width="100%"
            height="100%"
            style={{ objectFit: 'contain', objectPosition: 'center center' }}
          />
        </Box>
      )}
    </>
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
