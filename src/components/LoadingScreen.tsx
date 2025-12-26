import { m } from 'framer-motion';
// @mui
import { styled } from '@mui/material/styles';
import { SxProps, Box, Typography } from '@mui/material';
// config
import { DASHBOARD_NAVBAR_WIDTH, DASHBOARD_HEADER_DESKTOP } from '../config';
//
import LogoLoading from './LogoLoading';
import ProgressBar from './ProgressBar';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 99999,
  width: '100%',
  height: '100%',
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

type Props = {
  isDashboard?: boolean;
  message?: string;
  maxWidth?: string;
  startWhiteLabel?: boolean;
  sx?: SxProps;
};

export default function LoadingScreen({
  isDashboard,
  message,
  maxWidth,
  startWhiteLabel,
  ...other
}: Props) {
  return (
    <>
      <ProgressBar />

      <RootStyle
        sx={{
          ...(isDashboard && {
            width: { lg: `calc(100% - ${DASHBOARD_NAVBAR_WIDTH}px)` },
            height: { lg: `calc(100% - ${DASHBOARD_HEADER_DESKTOP}px)` },
          }),
        }}
        {...other}
      >
        <Box>
          <m.div initial={{ rotateY: 0 }}>
            <LogoLoading startWhiteLabel sx={{ width: 180, height: 'auto', mx: 'auto' }} />
          </m.div>
          {message && (
            <Box
              sx={{
                maxWidth: maxWidth || 'none',
                textAlign: 'center',
                p: 1,
                pb: 0,
                transition: 'all 1s ease-in-out',
                transitionDelay: '2s',
                animation: 'blink normal 7s infinite ease-in-out',
                '@keyframes blink': {
                  '0%': {
                    opacity: 0.3,
                  },
                  '50%': {
                    opacity: 1,
                  },
                  '100%': {
                    opacity: 0.3,
                  },
                },
              }}
            >
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                {message}
              </Typography>
            </Box>
          )}
        </Box>
      </RootStyle>
    </>
  );
}
