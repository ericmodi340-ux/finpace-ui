import { useState } from 'react';
// @mui
import {
  Box,
  Chip,
  Stack,
  Divider,
  TextField,
  Typography,
  IconButton,
  StackProps,
  DrawerProps,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  styled,
  TextareaAutosize,
} from '@mui/material';
// components
import Iconify from 'components/Iconify';
import NoteThumbnail from './NoteThumbnail';
import NoteShareDialog from './NoteShareDialog';
import useUserFromStore from 'hooks/useUserFromStore';
import { useParams } from 'react-router';
import { UserRole } from '../../../@types/user';
import { ClientManager, ClientNote } from '../../../@types/client';
import { getClientCompositeName } from 'utils/clients';
import { roles } from 'constants/users';
import DateComponent from 'components/DateComponent';
import { updateClientMeetingNote, updateClientNote } from 'redux/slices/client';
import useClientTags from 'hooks/useClientTags';
import { LoadingButton } from '@mui/lab';

// ----------------------------------------------------------------------

interface Props extends DrawerProps {
  note: ClientNote;
  favorited?: boolean;
  open: boolean;
  onFavorite?: VoidFunction;
  onCopyLink: VoidFunction;
  onClose: VoidFunction;
  onDelete: VoidFunction;
  isNote?: boolean;
  folder?: string;
  isEditable?: boolean;
}

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

export default function NoteDetailsDialog({
  note,
  open,
  favorited,
  onCopyLink,
  onClose,
  onDelete,
  isNote = true,
  folder = 'Case Notes',
  isEditable = false,
  ...other
}: Props) {
  const { clientId = '' } = useParams();
  const CLIENT_TAGS = useClientTags();

  const currentClient = useUserFromStore(
    clientId,
    roles.CLIENT as UserRole.CLIENT
  ) as ClientManager;
  const clientName = getClientCompositeName(currentClient);

  const [openShare, setOpenShare] = useState(false);

  const [noteData, setNoteData] = useState(note.text || '');
  const [tagsData, setTagsData] = useState(note.tags || []);

  const [toggleTags, setToggleTags] = useState(true);

  const [loading, setLoading] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');

  const [toggleProperties, setToggleProperties] = useState(true);

  const handleToggleTags = () => {
    setToggleTags(!toggleTags);
  };

  const handleToggleProperties = () => {
    setToggleProperties(!toggleProperties);
  };
  const handleCloseShare = () => {
    setOpenShare(false);
  };
  const handleChangeInvite = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(event.target.value);
  };

  const handleOnSave = async () => {
    const payload = {
      ...note,
      tags: tagsData,
    };

    if (note.attachmentLabel) {
      payload.attachmentLabel = noteData;
    }

    if (note.text) {
      payload.text = noteData;
    }
    setLoading(true);
    folder === 'Case Notes'
      ? await updateClientNote(clientId, note.noteId, payload)
      : await updateClientMeetingNote(clientId, note.noteId, payload);
    setLoading(false);
  };

  const notesOnChange = async (_event: any, newValue: string[]) => {
    setTagsData(newValue);
  };

  return (
    <>
      <Dialog scroll="paper" open={open} fullWidth maxWidth="md" onClose={onClose} {...other}>
        <DialogTitle>{clientName || 'Info'}</DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.neutral', mt: 3 }}>
          <Stack mt={3} spacing={2.5} justifyContent="center">
            {noteData && (
              <Stack>
                <LabelStyle>YOUR NOTE</LabelStyle>
                <TextareaAutosize
                  disabled={true}
                  value={noteData}
                  style={{
                    color: 'inherit',
                    height: note.text ? 200 : 'auto',
                    background: 'inherit',
                  }}
                  onChange={(e) => setNoteData(e.target.value)}
                />
              </Stack>
            )}

            {note?.attachmentUrl && (
              <NoteThumbnail showDetails file={note} sx={{ width: 64, height: 64 }} />
            )}

            <Divider sx={{ borderStyle: 'dashed' }} />

            {note?.clientText && (
              <Stack>
                <LabelStyle>CLIENT NOTE</LabelStyle>
                <TextareaAutosize
                  disabled={true}
                  value={note?.clientText || ''}
                  style={{
                    color: 'inherit',
                    height: note.text ? 200 : 'auto',
                    background: 'inherit',
                  }}
                />
              </Stack>
            )}

            {isNote && (
              <Stack spacing={1}>
                <Panel label="Tags" toggle={toggleTags} onToggle={handleToggleTags} />

                {toggleTags && (
                  <Autocomplete
                    multiple
                    disabled={!isEditable}
                    freeSolo
                    options={CLIENT_TAGS}
                    value={tagsData}
                    onChange={notesOnChange}
                    renderTags={(value: readonly string[], getTagProps) =>
                      value.map((option: string, index: number) => (
                        <Chip
                          {...getTagProps({ index })}
                          size="small"
                          label={option}
                          key={option}
                        />
                      ))
                    }
                    renderInput={(params) => <TextField {...params} placeholder="#Add a tags" />}
                  />
                )}
              </Stack>
            )}

            <Stack spacing={1.5}>
              <Panel
                label="Properties"
                toggle={toggleProperties}
                onToggle={handleToggleProperties}
              />

              {toggleProperties && (
                <Stack spacing={1.5}>
                  <Row label="Modified" value={<DateComponent date={note.createdAt} />} />
                </Stack>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        {isEditable && (
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <LoadingButton
              color="info"
              variant="contained"
              loading={loading}
              onClick={handleOnSave}
            >
              Save
            </LoadingButton>
          </DialogActions>
        )}
      </Dialog>
      <NoteShareDialog
        open={openShare}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onCopyLink={onCopyLink}
        onClose={() => {
          handleCloseShare();
          setInviteEmail('');
        }}
      />
    </>
  );
}

// ----------------------------------------------------------------------

interface PanelProps extends StackProps {
  label: string;
  toggle: boolean;
  onToggle: VoidFunction;
}

function Panel({ label, toggle, onToggle, ...other }: PanelProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" {...other}>
      <Typography variant="subtitle2"> {label} </Typography>

      <IconButton size="small" onClick={onToggle}>
        <Iconify icon={toggle ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
      </IconButton>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type RowProps = {
  label: string;
  value: string | JSX.Element;
};

function Row({ label, value = '' }: RowProps) {
  return (
    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
        {label}
      </Box>

      {value}
    </Stack>
  );
}
