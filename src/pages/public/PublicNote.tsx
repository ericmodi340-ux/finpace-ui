import { LoadingButton } from '@mui/lab';
import {
  Container,
  Divider,
  Stack,
  Typography,
  styled,
  useTheme,
  TextareaAutosize,
} from '@mui/material';
import { ClientNote } from '../../@types/client';
import LoadingScreen from 'components/LoadingScreen';
import { useSnackbar } from 'notistack';
import Page404 from 'pages/Page404';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getClientNotePublic, saveClientNotePublic } from 'redux/slices/clients';
import { NoteThumbnail } from 'sections/@dashboard/notes';

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  justifyItems: 'center',
  background: theme.palette.background.neutral,
}));

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

export default function PublicNote() {
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const { noteId = '' } = useParams();
  const clientId = searchParams.get('clientId');
  const theme = useTheme();
  const [fetchingNote, setFetchingNote] = useState(false);
  const [updatingNote, setUpdatingNote] = useState(false);

  const [note, setNote] = useState<ClientNote | null>(null);
  const [clientNote, setClientNote] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    async function getNotesData() {
      try {
        if (clientId && noteId && !note) {
          setFetchingNote(true);
          const response = await getClientNotePublic(clientId, noteId);
          setFetchingNote(false);
          if (response.error) {
            setError(true);
            return;
          }
          setNote(response);
          setClientNote(response?.clientText || '');
        }
      } catch (error) {
        setFetchingNote(false);
        setError(true);
      }
    }
    getNotesData();
  }, [clientId, noteId, note]);

  if (fetchingNote) {
    return <LoadingScreen />;
  }

  if (error && !note) {
    return <Page404 />;
  }

  const handleOnSave = async () => {
    if (clientId && noteId) {
      try {
        const payload = {
          clientText: clientNote,
        };
        setUpdatingNote(true);
        await saveClientNotePublic(clientId, noteId, payload);
        await getClientNotePublic(clientId, noteId);
        enqueueSnackbar('Note Updated Succcessfully!', { variant: 'success' });
        setUpdatingNote(false);
      } catch (err) {
        enqueueSnackbar('Something went wrong!', { variant: 'error' });
        setUpdatingNote(false);
      }
    }
  };

  return (
    <RootStyle>
      <Container
        maxWidth="md"
        sx={{
          flexGrow: 1,
          borderRadius: 2,
          my: 5,
        }}
      >
        <Stack sx={{ background: theme.palette.background.paper, borderRadius: 1 }}>
          <Stack
            p={3}
            sx={{
              background: theme.palette.background.default,
              borderRadius: 1,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <Typography variant="h4">Meeting Notes</Typography>
          </Stack>
          <Stack spacing={3} p={3}>
            {note?.text && (
              <Stack>
                <LabelStyle>ADVISOR NOTE</LabelStyle>
                <TextareaAutosize
                  disabled={true}
                  value={note?.text || ''}
                  style={{
                    color: 'inherit',
                    height: 200,
                    background: 'inherit',
                  }}
                />
              </Stack>
            )}

            {note?.attachmentUrl && (
              <NoteThumbnail showDetails file={note} sx={{ width: 64, height: 64 }} />
            )}

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack>
              <LabelStyle>ADD COMMENT</LabelStyle>
              <TextareaAutosize
                value={clientNote}
                style={{
                  color: 'inherit',
                  height: 200,
                  background: 'inherit',
                  borderColor: 'inherit',
                }}
                placeholder="Type your note here..."
                onChange={(e) => setClientNote(e.target.value)}
              />
            </Stack>
            <Stack alignItems="end">
              <LoadingButton
                color="info"
                variant="contained"
                disabled={clientNote === (note?.clientText || '')}
                loading={updatingNote}
                onClick={handleOnSave}
                sx={{ width: 120 }}
              >
                Reply
              </LoadingButton>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </RootStyle>
  );
}
