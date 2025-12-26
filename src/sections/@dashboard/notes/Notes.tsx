import { Stack, TablePagination, useTheme, Typography, Skeleton } from '@mui/material';
import { ClientNote } from '../../../@types/client';
import Scrollbar from 'components/Scrollbar';
import { useEffect, useState } from 'react';
import NoteFolderCard from './NoteFolderCard';
import NoteListCard from './NoteListCard';
import NotesPanel from './NotesPanel';
import { useSelector } from 'redux/store';
import { orderBy } from 'lodash';
import NotesListToolbar from './NotesListToolbar';
import { fTimestamp } from 'utils/formatTime';
import useClientTags from 'hooks/useClientTags';

type Props = {
  setOpen: (open: boolean) => void;
  folder: string;
  setFolder: (v: string) => void;
  clientId: string;
};
// TODO: How folders will be created in S3, and fetch them
const FOLDER_NAME = ['Case Notes', 'Meeting Notes'];
const Notes = ({ setOpen, folder, setFolder, clientId }: Props) => {
  const theme = useTheme();
  const { isLoading, notes: caseNotes, meetingNotes } = useSelector((state) => state.client);

  const _folders = FOLDER_NAME.map((folder, index) => ({
    id: `${index}_folders`,
    name: folder,
    type: 'folder',
    totalFiles: folder === 'Case Notes' ? caseNotes.length : meetingNotes.length,
    tags: ['Docs', 'Work'],
  }));

  const [selectedNotes, setSelectedNotes] = useState(caseNotes);
  const [filterName, setFilterName] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);

  const notesDataFiltered = applyFilter({
    inputData: selectedNotes,
    filterName,
    filterTag,
    filterStartDate,
    filterEndDate,
  });

  // Pagination
  const [cardsPerPage, setCardsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const CLIENT_TAGS = useClientTags();

  useEffect(() => {
    if (caseNotes) {
      if (folder === 'Case Notes') setSelectedNotes(caseNotes);
      else if (folder === 'Meeting Notes') setSelectedNotes(meetingNotes);
    }
  }, [caseNotes, meetingNotes, folder, selectedNotes]);

  const handleToggleNotes = (folder: any) => {
    setFolder(folder.name);
  };

  // Get index of last row based on the page
  // And make a slice of the clients to show
  const indexOfLastRow = (page + 1) * cardsPerPage;
  const indexOfFirstRow = indexOfLastRow - cardsPerPage;
  const orderedNotes = orderBy(notesDataFiltered, ['createdAt'], ['desc']);
  const currentNotes = orderedNotes.slice(indexOfFirstRow, indexOfLastRow);

  const addNoteTitle = `Add ${folder === 'Case Notes' ? 'Case' : 'Meeting'} Note`;

  const isFiltered =
    filterName !== '' || filterTag !== 'all' || !!filterStartDate || !!filterEndDate;

  const isNotFound =
    (!currentNotes.length && !!filterName) ||
    (!currentNotes.length && !!filterTag) ||
    (!currentNotes.length && !!filterEndDate) ||
    (!currentNotes.length && !!filterStartDate);

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterTag = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterTag(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterTag('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  return (
    <Scrollbar>
      <Stack direction="row" spacing={3} sx={{ pb: 3 }}>
        {_folders.map((folderMap: any) => (
          <NoteFolderCard
            key={folderMap.id}
            folder={folderMap}
            clientId={clientId}
            onDelete={() => console.log('DELETE', folderMap.id)}
            sx={{
              ...(folderMap.name === folder && {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
              }),
            }}
            handleToggleNotes={() => handleToggleNotes(folderMap)}
          />
        ))}
      </Stack>
      <NotesPanel title={addNoteTitle} setOpen={setOpen} sx={{ mt: 2 }} />

      <NotesListToolbar
        isFiltered={isFiltered}
        filterName={filterName}
        filterTag={filterTag}
        filterEndDate={filterEndDate}
        onFilterName={handleFilterName}
        optionsTag={['all', ...CLIENT_TAGS]}
        onResetFilter={handleResetFilter}
        filterStartDate={filterStartDate}
        onFilterTag={handleFilterTag}
        onFilterStartDate={(newValue) => {
          setFilterStartDate(newValue);
        }}
        onFilterEndDate={(newValue) => {
          setFilterEndDate(newValue);
        }}
      />

      <Stack spacing={2}>
        <Stack spacing={2} sx={{ height: { md: 450 } }}>
          {isLoading ? (
            Array(5)
              .fill(1)
              .map((_, i) => (
                <Skeleton
                  sx={{ bgcolor: 'grey.900' }}
                  variant="rectangular"
                  width="100%"
                  height={60}
                  key={i}
                />
              ))
          ) : isNotFound ? (
            <Typography textAlign="center" marginTop={10}>
              No Notes Found
            </Typography>
          ) : (
            currentNotes.map((note: ClientNote) => (
              <NoteListCard
                key={note.noteId}
                note={note}
                folder={folder}
                onDelete={() => console.log('DELETE', note.noteId)}
              />
            ))
          )}
        </Stack>

        <TablePagination
          rowsPerPage={cardsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={notesDataFiltered.length}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setCardsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Stack>
    </Scrollbar>
  );
};

export default Notes;

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  filterName,
  filterTag,
  filterStartDate,
  filterEndDate,
}: {
  inputData: ClientNote[];
  filterName: string;
  filterTag: string;
  filterStartDate: Date | null;
  filterEndDate: Date | null;
}) {
  if (filterName) {
    inputData = inputData.filter(
      (note) =>
        note.attachmentUrl?.toLowerCase().indexOf(filterName.toLowerCase()) > 0 ||
        note.text?.toLowerCase().indexOf(filterName.toLowerCase()) > 0
    );
  }

  if (filterTag !== 'all') {
    inputData = inputData.filter((note) => note.tags.some((c) => c === filterTag));
  }

  if (filterStartDate && filterEndDate) {
    inputData = inputData.filter(
      (note) =>
        fTimestamp(note.createdAt) >= fTimestamp(filterStartDate) &&
        fTimestamp(note.createdAt) <= fTimestamp(filterEndDate)
    );
  }

  return inputData;
}
