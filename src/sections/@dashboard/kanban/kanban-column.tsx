import { useCallback } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';

import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
} from 'redux/api/kanban'; // Import the mutation hooks

import Iconify from 'components/Iconify';

import { IKanbanTask, IKanbanColumn } from '../../../@types/kanban';

import KanbanTaskAdd from './kanban-task-add';
import KanbanTaskItem from './kanban-task-item';
import KanbanColumnToolBar from './kanban-column-tool-bar';
import { useBoolean } from 'hooks/useBoolean';
import { useSnackbar } from 'notistack';

// ----------------------------------------------------------------------

type Props = {
  column: IKanbanColumn;
  tasks: Record<string, IKanbanTask>;
  index: number;
};

export default function KanbanColumn({ column, tasks, index }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const openAddTask = useBoolean();

  // Mutation hooks
  const [updateColumnMutation] = useUpdateColumnMutation();
  const [deleteColumnMutation] = useDeleteColumnMutation();
  const [createTaskMutation] = useCreateTaskMutation();
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();

  const handleUpdateColumn = useCallback(
    async (columnName: string) => {
      try {
        if (column.name !== columnName) {
          await updateColumnMutation({ columnId: column.id, columnName }).unwrap();

          enqueueSnackbar('Update success!', {
            anchorOrigin: { vertical: 'top', horizontal: 'center' },
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, column.name, enqueueSnackbar, updateColumnMutation]
  );

  const handleClearColumn = useCallback(async () => {
    try {
      // Delete all tasks in the column
      const deletePromises = column.taskIds.map((taskId) =>
        deleteTaskMutation({ columnId: column.id, taskId }).unwrap()
      );

      await Promise.all(deletePromises);

      enqueueSnackbar('Column cleared!', {
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
    } catch (error) {
      console.error(error);
    }
  }, [column.id, column.taskIds, deleteTaskMutation, enqueueSnackbar]);

  const handleDeleteColumn = useCallback(async () => {
    try {
      await deleteColumnMutation({ columnId: column.id }).unwrap();

      enqueueSnackbar('Delete success!', {
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
    } catch (error) {
      console.error(error);
    }
  }, [column.id, enqueueSnackbar, deleteColumnMutation]);

  const handleAddTask = useCallback(
    async (taskData: IKanbanTask) => {
      try {
        await createTaskMutation({ columnId: column.id, taskData }).unwrap();

        openAddTask.onFalse();
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, openAddTask, createTaskMutation]
  );

  const handleUpdateTask = useCallback(
    async (taskData: IKanbanTask) => {
      try {
        await updateTaskMutation({ taskData }).unwrap();
      } catch (error) {
        console.error(error);
      }
    },
    [updateTaskMutation]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        await deleteTaskMutation({ columnId: column.id, taskId }).unwrap();

        enqueueSnackbar('Delete success!', {
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, enqueueSnackbar, deleteTaskMutation]
  );

  const renderAddTask = (
    <Stack
      spacing={2}
      sx={{
        pb: 3,
      }}
    >
      {openAddTask.value && (
        <KanbanTaskAdd
          status={column.name}
          onAddTask={handleAddTask}
          onCloseAddTask={openAddTask.onFalse}
        />
      )}

      <Button
        fullWidth
        size="large"
        color="inherit"
        startIcon={
          <Iconify
            icon={openAddTask.value ? 'solar:close-circle-broken' : 'mingcute:add-line'}
            width={18}
            sx={{ mr: -0.5 }}
          />
        }
        onClick={openAddTask.onToggle}
        sx={{ fontSize: 14 }}
      >
        {openAddTask.value ? 'Close' : 'Add Task'}
      </Button>
    </Stack>
  );

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            px: 2,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            ...(snapshot.isDragging && {
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.24),
            }),
          }}
        >
          <Stack {...provided.dragHandleProps}>
            <KanbanColumnToolBar
              columnName={column.name}
              onUpdateColumn={handleUpdateColumn}
              onClearColumn={handleClearColumn}
              onDeleteColumn={handleDeleteColumn}
            />

            <Droppable droppableId={column.id} type="TASK">
              {(dropProvided) => (
                <Stack
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                  spacing={2}
                  sx={{
                    py: 3,
                    width: 280,
                  }}
                >
                  {column.taskIds.map((taskId, taskIndex) => (
                    <KanbanTaskItem
                      key={taskId}
                      index={taskIndex}
                      task={tasks[taskId]}
                      onUpdateTask={handleUpdateTask}
                      onDeleteTask={() => handleDeleteTask(taskId)}
                    />
                  ))}
                  {dropProvided.placeholder}
                </Stack>
              )}
            </Droppable>

            {renderAddTask}
          </Stack>
        </Paper>
      )}
    </Draggable>
  );
}
