import { useState, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { inputBaseClasses } from '@mui/material/InputBase';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { v4 as uuidv4 } from 'uuid';

import Iconify from 'components/Iconify';
import { useCreateColumnMutation } from 'redux/api/kanban';

// ----------------------------------------------------------------------

export default function KanbanColumnAdd() {
  const [columnName, setColumnName] = useState('');

  const [openAddColumn, setOpenAddColumn] = useState(false);

  const [createColumn] = useCreateColumnMutation(); // Use the mutation hook

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(event.target.value);
  }, []);

  const handleCreateColumn = useCallback(async () => {
    try {
      if (columnName) {
        // Call the createColumn mutation
        await createColumn({
          id: uuidv4(),
          name: columnName,
          taskIds: [],
        }).unwrap(); // Unwrap to handle the promise
        setColumnName('');
      }
      setOpenAddColumn(false); // Close the input field
    } catch (error) {
      console.error(error);
    }
  }, [columnName, createColumn]);

  const handleKeyUpCreateColumn = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleCreateColumn();
      }
    },
    [handleCreateColumn]
  );

  return (
    <Paper sx={{ minWidth: 280, width: 280 }}>
      {openAddColumn ? (
        <ClickAwayListener onClickAway={handleCreateColumn}>
          <TextField
            autoFocus
            fullWidth
            placeholder="New section"
            value={columnName}
            onChange={handleChangeName}
            onKeyUp={handleKeyUpCreateColumn}
            sx={{
              [`& .${inputBaseClasses.input}`]: {
                typography: 'h6',
              },
            }}
          />
        </ClickAwayListener>
      ) : (
        <Button
          fullWidth
          size="large"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mingcute:add-line" sx={{ mr: -0.5 }} />}
          onClick={() => setOpenAddColumn(true)}
        >
          Add Section
        </Button>
      )}
    </Paper>
  );
}
