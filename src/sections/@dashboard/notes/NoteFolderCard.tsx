import { useState } from 'react';
// @mui
import { Box, Card, Stack, MenuItem, CardProps, IconButton } from '@mui/material';
import Iconify from 'components/Iconify';
import MenuPopover from 'components/MenuPopover';
import TextMaxLine from 'components/TextMaxLine';
import { exportData } from 'redux/slices/firm';
import { useSnackbar } from 'notistack';
import useUser from 'hooks/useUser';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  folder: any;
  onDelete: VoidFunction;
  handleToggleNotes: VoidFunction;
  clientId: string;
}

export default function NoteFolderCard({
  folder,
  onDelete,
  handleToggleNotes,
  sx,
  clientId,
  ...other
}: Props) {
  const [hover, setHover] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleShowHover = () => {
    setHover(true);
  };

  const handleHideHover = () => {
    setHover(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleExport = async () => {
    handleClosePopover();
    if (user?.firmId) {
      folder?.name === 'Case Notes'
        ? await exportData(user.firmId, {
            type: 'notes',
            subType: 'case-notes',
            clientId,
          })
        : await exportData(user.firmId, {
            type: 'notes',
            subType: 'meeting-notes',
            clientId,
          });
      enqueueSnackbar(`Success: You will receive an email with the link to download the notes.`, {
        variant: 'success',
      });
    }
  };

  return (
    <>
      <Card
        onMouseEnter={handleShowHover}
        onMouseLeave={handleHideHover}
        sx={{
          p: 2.5,
          width: 1,
          maxWidth: 222,
          boxShadow: 0,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...(hover && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
            cursor: 'pointer',
          }),
          ...sx,
        }}
        {...other}
      >
        <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute' }}>
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>

        <Box onClick={handleToggleNotes}>
          <Box component="img" src="/icons/ic_folder.svg" sx={{ width: 40, height: 40 }} />

          <TextMaxLine
            variant="h6"
            sx={{
              mt: 1,
              mb: 0.5,
            }}
          >
            {folder.name}
          </TextMaxLine>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{ typography: 'caption', color: 'text.disabled' }}
          >
            <Box> {folder.totalFiles} files </Box>
          </Stack>
        </Box>
      </Card>

      <MenuPopover
        open={Boolean(openPopover)}
        onClose={handleClosePopover}
        anchorEl={openPopover}
        sx={{ width: 160 }}
      >
        <MenuItem onClick={handleExport}>
          <Iconify sx={{ mr: 1 }} icon="mdi:export-variant" />
          Export
        </MenuItem>
      </MenuPopover>
    </>
  );
}
