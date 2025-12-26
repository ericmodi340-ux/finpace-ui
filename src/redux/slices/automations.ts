import { map, filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import { AutomationState, NewAutomationConfig } from '../../@types/automation';
// actions
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: AutomationState = {
  isLoading: false,
  error: null,
  automations: [],
  scheduledJobs: [],
};

const slice = createSlice({
  name: 'automations',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // STOP LOADING
    stopLoading(state) {
      state.isLoading = false;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET AUTOMATIONS
    getAutomationsSuccess(state, action) {
      const automations = action.payload;

      return {
        ...state,
        isLoading: false,
        automations,
      };
    },

    // GET AUTOMATIONS
    getScheduledJobsSuccess(state, action) {
      const scheduledJobs = action.payload;

      return {
        ...state,
        isLoading: false,
        scheduledJobs,
      };
    },

    // CREATE AUTOMATION
    createAutomationsSuccess(state, action) {
      const newAutomations = action.payload;

      return {
        ...state,
        isLoading: false,
        automations: [...state.automations, newAutomations],
      };
    },

    // UPDATE AUTOMATION
    updateAutomationSuccess(state, action) {
      const updateAutomation = action.payload;
      const updateAutomations = map(state.automations, (_automation) => {
        if (_automation.id === updateAutomation.id) {
          return updateAutomation;
        }
        return _automation;
      });

      state.isLoading = false;
      state.automations = updateAutomations;
    },

    // DELETE AUTOMATION
    deleteAutomationSuccess(state, action) {
      const { id } = action.payload;
      const deleteAutomations = filter(state.automations, (automation) => automation.id !== id);

      return {
        ...state,
        isLoading: false,
        automations: deleteAutomations,
      };
    },

    // DELETE SCHEDULED JOB
    deleteScheduledJobSuccess(state, action) {
      const { blueprintId } = action.payload;

      const deleteScheduledJobs = filter(
        state.scheduledJobs,
        (automation) => automation?.blueprintId !== blueprintId
      );

      return {
        ...state,
        isLoading: false,
        scheduledJobs: deleteScheduledJobs,
      };
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getAutomations() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/v2/automations`, {});
      dispatch(slice.actions.getAutomationsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in AUTOMATIONS slice in the getAutomations function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getScheduledJobs() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/v2/automations/scheduled-automations`, {});
      dispatch(slice.actions.getScheduledJobsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in AUTOMATIONS slice in the getScheduledJobs function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function createAutomation(newAutomation: NewAutomationConfig) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/v2/automations`, {
      body: newAutomation,
    });
    dispatch(slice.actions.stopLoading(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in AUTOMATIONS slice in the createAutomation function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function deleteScheduledJob(id: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.del(
      'bitsybackendv2',
      `/v2/automations/scheduled-automations/${id}`,
      {}
    );
    dispatch(slice.actions.deleteScheduledJobSuccess({ blueprintId: id }));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in AUTOMATIONS slice in the deleteScheduledJob function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
