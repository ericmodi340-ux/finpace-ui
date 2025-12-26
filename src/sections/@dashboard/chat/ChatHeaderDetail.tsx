// @mui
import { styled } from '@mui/material/styles';
import { Box, IconButton, MenuItem, Typography } from '@mui/material';
// utils
// @types
// components
import UserAvatar from 'components/UserAvatar';
import { getFirmAdminName } from 'utils/firmAdmins';
import { FirmAdminManager } from '../../../@types/firmAdmin';
import { roles } from 'constants/users';
import { AdvisorManager } from '../../../@types/advisor';
import { UserRole } from '../../../@types/user';
import { ClientManager } from '../../../@types/client';
import { getAdvisorName } from 'utils/advisors';
import Iconify from 'components/Iconify';
import { useState } from 'react';
import MenuPopover from 'components/MenuPopover';
import { useSnackbar } from 'notistack';
import { exportData } from 'redux/slices/firm';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  flexShrink: 0,
  minHeight: 92,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 3),
}));

// ----------------------------------------------------------------------

type Props = {
  user: ClientManager;
  type: UserRole.ADVISOR | UserRole.FIRM_ADMIN;
  clientId: string;
};

export default function ChatHeaderDetail({ user, type, clientId }: Props) {
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  let name;

  if (type === roles.ADVISOR) name = getAdvisorName(user as unknown as AdvisorManager);
  if (type === roles.FIRM_ADMIN) name = getFirmAdminName(user as unknown as FirmAdminManager);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleExport = async () => {
    handleClosePopover();
    try {
      const payload = {
        type: 'sms',
        clientId,
      };
      await exportData(user.firmId, payload);
      enqueueSnackbar(`Success: You will receive an email with the link to download the chats.`, {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar(`Error: Something went wrong.`, {
        variant: 'error',
      });
    }
  };

  return (
    <RootStyle>
      <UserAvatar
        user={{
          type:
            type === roles.ADVISOR && (user as unknown as AdvisorManager)?.isFirmAdmin
              ? (roles.FIRM_ADMIN as UserRole.FIRM_ADMIN)
              : type,
          id: user?.id,
          name,
        }}
        sx={{ mr: 2 }}
      />
      <Typography>{user?.name}</Typography>

      <Box sx={{ flexGrow: 1 }} />
      <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
      <MenuPopover
        open={Boolean(openPopover)}
        onClose={handleClosePopover}
        anchorEl={openPopover}
        sx={{ width: 150 }}
      >
        <MenuItem onClick={handleExport}>
          <Iconify mr={1} icon="mdi:export-variant" />
          Export
        </MenuItem>
      </MenuPopover>
    </RootStyle>
  );
}
