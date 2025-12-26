import { memo } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, Button } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
import useCollapseDrawer from '../../../hooks/useCollapseDrawer';
// utils
import cssStyles from '../../../utils/cssStyles';
// config
import {
  DASHBOARD_NAVBAR_WIDTH,
  DASHBOARD_NAVBAR_COLLAPSE_WIDTH,
  DASHBOARD_HEADER_MOBILE,
  DASHBOARD_HEADER_DESKTOP,
  HEADER_FREE_TRIAL,
} from '../../../config';
// components
import Iconify from '../../../components/Iconify';
import { IconButtonAnimate } from '../../../components/animate';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
// import ContactsPopover from './ContactsPopover';
import NotificationsPopover from './NotificationsPopover';
// hooks
import useUser from 'hooks/useUser';
// constants
import { roles } from 'constants/users';
import { PATH_DOCS, PATH_DOCS_CLIENT } from 'routes/paths';
import shouldShowBanner from 'utils/showBanner';

// ----------------------------------------------------------------------

type RootStyleProps = {
  isCollapse: boolean | undefined;
};

const RootStyle = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'isCollapse',
})<RootStyleProps>(({ isCollapse, theme }) => ({
  boxShadow: 'none',
  ...cssStyles(theme).bgBlur(),
  transition: theme.transitions.create('width', {
    duration: theme.transitions.duration.shorter,
  }),
  [theme.breakpoints.up('lg')]: {
    width: `calc(100% - ${DASHBOARD_NAVBAR_WIDTH + 1}px)`,
    ...(isCollapse && {
      width: `calc(100% - ${DASHBOARD_NAVBAR_COLLAPSE_WIDTH}px)`,
    }),
  },
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: DASHBOARD_HEADER_MOBILE,
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(0, 5),
    minHeight: DASHBOARD_HEADER_DESKTOP,
  },
}));

// ----------------------------------------------------------------------

type Props = {
  onOpenSidebar: VoidFunction;
};

const DashboardHeader = ({ onOpenSidebar }: Props) => {
  const { isCollapse } = useCollapseDrawer();
  const { authUser } = useUser();
  const bannerActive = shouldShowBanner();

  const isDesktop = useResponsive('up', 'lg');

  return (
    <RootStyle
      isCollapse={isCollapse}
      sx={{
        marginTop: `${bannerActive ? `${HEADER_FREE_TRIAL}px` : ''}`,
      }}
    >
      <ToolbarStyle>
        {!isDesktop && (
          <IconButtonAnimate onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary' }}>
            <Iconify icon="eva:menu-2-fill" />
          </IconButtonAnimate>
        )}

        <Searchbar />
        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          <Button
            href={authUser?.role === roles.CLIENT ? PATH_DOCS_CLIENT : PATH_DOCS}
            target="_blank"
            rel="noopener"
            variant="text"
          >
            {authUser?.role === roles.CLIENT ? 'University' : 'Docs'}
          </Button>
          <NotificationsPopover />
          {/* <ContactsPopover /> */}
          <AccountPopover />
        </Stack>
      </ToolbarStyle>
    </RootStyle>
  );
};

export default memo(DashboardHeader);
