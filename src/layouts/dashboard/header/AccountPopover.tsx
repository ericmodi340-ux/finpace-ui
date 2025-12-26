import { useSnackbar } from 'notistack';
import { useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import {
  Box,
  Divider,
  MenuItem,
  Typography,
  Stack,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// hooks
import useAuth from '../../../hooks/useAuth';
import useUser from 'hooks/useUser';
// components
import MyAvatar from '../../../components/MyAvatar';
import MenuPopover from '../../../components/MenuPopover';
// constants
import { roles } from 'constants/users';
// redux
import { updateAdvisor } from 'redux/slices/advisor';
import { updateFirmAdmin } from 'redux/slices/firmAdmins';
// types
import { AdvisorManager } from '../../../@types/advisor';
import { FirmAdminManager } from '../../../@types/firmAdmin';
//utils
import useAppTour from 'hooks/useAppTour';
import useUserFromStore from 'hooks/useUserFromStore';
import { useSelector } from 'redux/store';
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const { user, authUser } = useUser();
  const { isLoading: advisorLoading } = useSelector((state) => state.advisor);
  const { isLoading: adminLoading } = useSelector((state) => state.firmAdmins);
  const isLoading = advisorLoading || adminLoading;
  const currentUser = useUserFromStore(user?.id, authUser?.role) as
    | FirmAdminManager
    | AdvisorManager;

  // Consume useState from app tour context
  const { setOpenAppTour } = useAppTour();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout', { variant: 'error' });
    }
  };
  async function showTutorial() {
    const body = {
      settings: {
        ...currentUser?.settings,
        gettingStarted: {
          ...currentUser?.settings?.gettingStarted,
          hidden: false,
        },
      },
    };
    if (user && authUser?.role === roles.ADVISOR) {
      await updateAdvisor(user.id, body);
    }
    if (user && authUser?.role === roles.FIRM_ADMIN) {
      await updateFirmAdmin(user.id, body);
    }

    handleClose();
  }

  function openAppTour() {
    setOpenAppTour(true);
    setOpen(false);
  }

  const MENU_OPTIONS = [
    {
      label: 'Home',
      linkTo: '/',
    },
    {
      label: 'Settings',
      linkTo: PATH_DASHBOARD.settings.account,
    },
    {
      label: 'Product Tour',
      linkTo: '',
      openAppTour,
    },
    ...(authUser?.role === roles.FIRM_ADMIN
      ? [
          {
            label: 'Firm Settings',
            linkTo: PATH_DASHBOARD.settings.firm,
          },
        ]
      : []),
    ...(authUser?.role === roles.FIRM_ADMIN || authUser?.role === roles.ADVISOR
      ? [
          {
            label: 'Getting Started',
            linkTo: '/',
            showTutorial,
          },
        ]
      : []),
  ];
  const getPath = (label: string) => {
    const paths: { [key: string]: VoidFunction } = {
      'Getting Started': showTutorial,
      'Product Tour': openAppTour,
    };
    paths[label] && paths[label]();
  };
  const handleClick = (option: { label: string }) => {
    getPath(option.label);
    handleClose();
  };

  const copyFirmInfoToClipboard = async () => {
    try {
      const text = `
        User Name: ${user?.name}
        User ID: ${user?.id}
        Firm ID: ${user?.firmId}
        Role: ${authUser?.role}
        ${authUser?.advisorId ? 'Advisor ID: ' + authUser?.advisorId : ''}
      `;
      await navigator.clipboard.writeText(text);
    } catch (err) {
      enqueueSnackbar('Error in copying text', { variant: 'error' });
    }
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
        data-test="account-popover-toggle"
        id="header-account-onboarding"
      >
        <MyAvatar />
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {user?.name}
            <Tooltip title={'Copy account info to Clipboard'} sx={{ cursor: 'copy' }}>
              <IconButton aria-label="tip" type="button" onClick={copyFirmInfoToClipboard}>
                <Iconify width={12} height={12} icon="solar:clipboard-bold" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email}
          </Typography>
        </Box>

        <Divider />
        <Stack spacing={0.5} sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              to={option.linkTo}
              component={RouterLink}
              onClick={() => handleClick(option)}
              sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1 }}
            >
              {option.label}
              {option.label === 'Getting Started' && isLoading && (
                <CircularProgress size={'1.1rem'} sx={{ ml: 'auto' }} />
              )}
            </MenuItem>
          ))}
        </Stack>
        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1, m: 1 }}
          data-test="sign-out-button"
        >
          Logout
        </MenuItem>
      </MenuPopover>
    </>
  );
}
