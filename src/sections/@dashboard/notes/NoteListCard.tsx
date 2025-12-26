import { useState } from 'react';
// @mui
import { Box, Stack, MenuItem, Typography, PaperProps, IconButton, Chip } from '@mui/material';
import NoteDetailsDialog from './NoteDetailsDialog';
import useResponsive from 'hooks/useResponsive';
import NoteThumbnail from './NoteThumbnail';
import Iconify from 'components/Iconify';
import MenuPopover from 'components/MenuPopover';
import useCopyToClipboard from 'hooks/useCopyToClipboard';
import { useSnackbar } from 'notistack';
import DateComponent from 'components/DateComponent';
import { shareNoteWithClient } from 'redux/slices/clients';

// ----------------------------------------------------------------------

interface Props extends PaperProps {
  note: any;
  onDelete: VoidFunction;
  isCaseNote?: boolean;
  folder: string;
}

export default function NoteListCard({
  note,
  onDelete,
  isCaseNote = true,
  sx,
  folder,
  ...other
}: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const { copy } = useCopyToClipboard();
  const isDesktop = useResponsive('up', 'sm');
  const [isEditable, setIsEditable] = useState(false);

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const [openDetails, setOpenDetails] = useState(false);

  const handleOpenDetails = () => {
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setIsEditable(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleCopy = () => {
    enqueueSnackbar('Copied!');
    copy(note.url);
  };

  const shareWithClient = async () => {
    handleClosePopover();
    try {
      await shareNoteWithClient(note?.clientId, note?.noteId);
      enqueueSnackbar('Shared with client over email!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error sharing with client!', { variant: 'error' });
    }
  };

  const noteTitleContent =
    (note && note.text) ||
    (() => {
      const splitedFile = note?.attachmentUrl ? String(note?.attachmentUrl).split('/') : [];
      return splitedFile.length > 0 ? splitedFile[splitedFile.length - 1] : 'No Label';
    })();

  const noteTagsContent = (
    <>
      {note?.tags ? (
        note.tags.map((option: string) => <Chip size="small" label={option} key={option} />)
      ) : (
        <Chip size="small" label="No tag" color="info" variant="outlined" />
      )}
    </>
  );

  return (
    <>
      <Stack
        spacing={isDesktop ? 1.5 : 2}
        direction={isDesktop ? 'row' : 'column'}
        alignItems={isDesktop ? 'center' : 'flex-start'}
        sx={{
          p: 2.5,
          borderRadius: 2,
          position: 'relative',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          },
          ...(isDesktop && {
            p: 1.5,
            borderRadius: 1.5,
          }),
          ...sx,
        }}
        {...other}
      >
        <NoteThumbnail file={note} />

        <Stack
          onClick={handleOpenDetails}
          sx={{
            width: 1,
            flexGrow: { sm: 1 },
            minWidth: { sm: '1px' },
            '&:hover': {
              cursor: 'pointer',
            },
          }}
        >
          <Typography noWrap variant="body2">
            {isCaseNote ? noteTitleContent : note.name}
          </Typography>
          <Stack
            spacing={0.75}
            direction="row"
            alignItems="center"
            sx={{ typography: 'caption', color: 'text.disabled', mt: 0.5 }}
          >
            {isCaseNote ? noteTagsContent : <Box>File Size</Box>}
            <Box>
              <DateComponent date={note.createdAt} />
            </Box>
          </Stack>
        </Stack>

        <Box
          sx={{
            top: 8,
            right: 8,
            flexShrink: 0,
            position: 'absolute',
            ...(isDesktop && {
              position: 'unset',
            }),
          }}
        >
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Box>
      </Stack>

      <MenuPopover
        open={Boolean(openPopover)}
        onClose={handleClosePopover}
        anchorEl={openPopover}
        sx={{ width: 220 }}
      >
        <MenuItem
          onClick={() => {
            handleClosePopover();
            handleOpenDetails();
            setIsEditable(true);
          }}
        >
          <Iconify mr={1} icon="eva:edit-fill" />
          Edit Tags
        </MenuItem>
        {folder === 'Meeting Notes' && (
          <MenuItem onClick={shareWithClient}>
            <Iconify mr={1} icon="clarity:share-solid" />
            Share with client
          </MenuItem>
        )}
      </MenuPopover>

      <NoteDetailsDialog
        note={note}
        open={openDetails}
        folder={folder}
        isEditable={isEditable}
        // use isNote as a mock up version, later when we have
        // the right files, set it as true to handle tags
        isNote={isCaseNote}
        onClose={handleCloseDetails}
        onCopyLink={handleCopy}
        onDelete={() => {
          handleCloseDetails();
          onDelete();
        }}
      />
    </>
  );
}
