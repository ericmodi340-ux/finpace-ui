import { api } from './api'; // your base api slice
import { IKanban, IKanbanTask, IKanbanColumn } from '../../@types/kanban';

// Utility function to move a column
const moveColumnUtil = (draft: { board: IKanban }, newOrdered: string[]) => {
  draft.board.ordered = newOrdered;
};

// Utility function to move a task
const moveTaskUtil = (draft: { board: IKanban }, updateColumns: Record<string, IKanbanColumn>) => {
  draft.board.columns = updateColumns;
};

export const kanbanApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBoard: build.query<{ board: IKanban }, void>({
      query: () => ({
        url: 'kanban',
        method: 'GET',
      }),
      providesTags: ['Board'],
    }),

    createColumn: build.mutation<void, IKanbanColumn>({
      query: (columnData) => ({
        url: 'kanban/column',
        method: 'POST',
        body: { columnData },
      }),
      invalidatesTags: ['Board'],
      async onQueryStarted(columnData, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          kanbanApi.util.updateQueryData('getBoard', undefined, (draft) => {
            const { board } = draft;
            board.columns[columnData.id] = columnData;
            board.ordered.push(columnData.id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    updateColumn: build.mutation<void, { columnId: string; columnName: string }>({
      query: ({ columnId, columnName }) => ({
        url: 'kanban/column',
        method: 'PATCH',
        body: { columnId, columnName },
      }),
      invalidatesTags: ['Board'],
      async onQueryStarted({ columnId, columnName }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          kanbanApi.util.updateQueryData('getBoard', undefined, (draft) => {
            const column = draft.board.columns[columnId];
            if (column) {
              column.name = columnName;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    deleteColumn: build.mutation<void, { columnId: string }>({
      query: ({ columnId }) => ({
        url: 'kanban/column',
        method: 'DELETE',
        body: { columnId },
      }),
      invalidatesTags: ['Board'],
      async onQueryStarted({ columnId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          kanbanApi.util.updateQueryData('getBoard', undefined, (draft) => {
            const column = draft.board.columns[columnId];
            if (column) {
              column.taskIds.forEach((taskId) => {
                delete draft.board.tasks[taskId];
              });
              delete draft.board.columns[columnId];
              draft.board.ordered = draft.board.ordered.filter((id) => id !== columnId);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    createTask: build.mutation<void, { columnId: string; taskData: IKanbanTask }>({
      query: ({ columnId, taskData }) => ({
        url: 'kanban/task',
        method: 'POST',
        body: { columnId, taskData },
      }),
      invalidatesTags: ['Board'],
      async onQueryStarted({ columnId, taskData }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          kanbanApi.util.updateQueryData('getBoard', undefined, (draft) => {
            const column = draft.board.columns[columnId];
            if (column) {
              column.taskIds.push(taskData.id);
              draft.board.tasks[taskData.id] = taskData;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    updateTask: build.mutation<void, { taskData: IKanbanTask }>({
      query: ({ taskData }) => ({
        url: 'kanban/task',
        method: 'PATCH',
        body: { taskData },
      }),
      invalidatesTags: ['Board'],
      async onQueryStarted({ taskData }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          kanbanApi.util.updateQueryData('getBoard', undefined, (draft) => {
            draft.board.tasks[taskData.id] = taskData;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    deleteTask: build.mutation<void, { columnId: string; taskId: string }>({
      query: ({ columnId, taskId }) => ({
        url: 'kanban/task',
        method: 'DELETE',
        body: { columnId, taskId },
      }),
      invalidatesTags: ['Board'],
      async onQueryStarted({ columnId, taskId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          kanbanApi.util.updateQueryData('getBoard', undefined, (draft) => {
            const column = draft.board.columns[columnId];
            if (column) {
              column.taskIds = column.taskIds.filter((id) => id !== taskId);
              delete draft.board.tasks[taskId];
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetBoardQuery,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = kanbanApi;

// Utility functions for moving columns and tasks
export const moveColumn = (newOrdered: string[]) =>
  kanbanApi.util.updateQueryData('getBoard', undefined, (draft) => {
    moveColumnUtil(draft, newOrdered);
  });

export const moveTask = (updateColumns: Record<string, IKanbanColumn>) =>
  kanbanApi.util.updateQueryData('getBoard', undefined, (draft) => {
    moveTaskUtil(draft, updateColumns);
  });
