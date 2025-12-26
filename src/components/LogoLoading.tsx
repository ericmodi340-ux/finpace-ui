import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, BoxProps, CircularProgress, Skeleton } from '@mui/material';
// redux
import { useSelector } from 'redux/store';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  startWhiteLabel?: boolean;
  disabledLink?: boolean;
}

export default function LogoLoading({ startWhiteLabel = false, disabledLink = true, sx }: Props) {
  const { firm, isLoading } = useSelector((state) => state.firm);

  const logo = (
    <Box
      sx={{
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      {startWhiteLabel || firm.whiteLabel ? (
        <CircularProgress />
      ) : isLoading ? (
        <Skeleton variant="rectangular" />
      ) : (
        <img
          src="/logo/logo_loading.gif"
          alt="Loading..."
          width="100%"
          height="100%"
          style={{ objectFit: 'contain', objectPosition: 'center center' }}
        />
      )}
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return <RouterLink to="/">{logo}</RouterLink>;
}
