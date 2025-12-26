// @mui
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Box, Tooltip, Typography } from '@mui/material';
// components
import UserAvatar from './UserAvatar';
import { UserRole } from '../@types/user';
import Iconify from './Iconify';

// ----------------------------------------------------------------------

export const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'center',
  },
  [theme.breakpoints.up('md')]: {
    justifyContent: 'flex-start',
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(18),
  },
}));

export const RootStyle = styled('div')(({ theme }) => ({
  '&:before': {
    top: 0,
    zIndex: 9,
    content: "''",
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
}));

export const InfoStyle = styled('div')(({ theme }) => ({
  left: 0,
  right: 0,
  zIndex: 99,
  position: 'absolute',
  marginTop: theme.spacing(5),
  [theme.breakpoints.up('md')]: {
    right: 'auto',
    display: 'flex',
    alignItems: 'center',
    left: theme.spacing(3),
    bottom: theme.spacing(3),
  },
}));

// ----------------------------------------------------------------------

type ProfileCoverProps = {
  name: string;
  id: string;
  type: UserRole.ADVISOR | UserRole.CLIENT | UserRole.FIRM_ADMIN;
  isProspect?: boolean;
  isFirmAdmin?: boolean;
};

export default function ProfileCover({
  name,
  id,
  type,
  isProspect,
  isFirmAdmin,
}: ProfileCoverProps) {
  const theme = useTheme();
  return (
    <RootStyle
      sx={{
        '&:before': {
          backgroundColor: alpha(theme.palette.primary.dark, 0.8),
        },
      }}
    >
      <InfoStyle>
        <UserAvatar
          user={{
            type,
            name,
            id,
          }}
          sx={{
            mx: 'auto',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: 'common.white',
            width: '100px !important',
            height: '100px !important',
          }}
        />
        <Box
          sx={{
            ml: { md: 3 },
            mt: { xs: 1, md: 0 },
            color: 'common.white',
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography variant="h4">{name}</Typography>
          <Box marginBottom="1rem" sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ opacity: 0.72, textTransform: 'capitalize', mr: 1 }}>
              {isProspect ? 'Prospect' : type}{' '}
            </Typography>
            {isFirmAdmin && (
              <Tooltip title="User is also a Firm Admin">
                <span>
                  <Iconify mt={0.5} icon="mdi:crown" />
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>
      </InfoStyle>
    </RootStyle>
  );
}
