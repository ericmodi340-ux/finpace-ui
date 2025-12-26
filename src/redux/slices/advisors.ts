import { filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';

// @types
import { AdvisorManager, AdvisorsState } from '../../@types/advisor';
// utils
import objFromArray from 'utils/objFromArray';
import deleteProperty from 'utils/deleteProperty';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: AdvisorsState = {
  isLoading: false,
  error: null,
  byId: {},
  allIds: [],
};

const slice = createSlice({
  name: 'advisors',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET ADVISORS
    getAdvisorsSuccess(state, action) {
      const advisors = action.payload;

      const advisorsObj = objFromArray(advisors);

      return {
        ...state,
        isLoading: false,
        byId: advisorsObj,
        allIds: Object.keys(advisorsObj),
      };
    },

    // CREATE ADVISOR
    createAdvisorSuccess(state, action) {
      const newAdvisor = action.payload;
      const { id } = newAdvisor;
      return {
        ...state,
        isLoading: false,
        showSuccess: true,
        byId: {
          ...state.byId,
          [id]: newAdvisor,
        },
        //If not exist Advisor in state then add its id
        allIds: state.allIds.includes(id) ? [...state.allIds] : [...state.allIds, id],
      };
    },

    // UPDATE ADVISOR
    updateAdvisorSuccess(state, action) {
      const { advisorId, updateAdvisor } = action.payload;
      state.isLoading = false;
      state.byId[advisorId] = { ...state.byId[advisorId], ...updateAdvisor };
    },

    // DELETE ADVISOR
    deleteAdvisorSuccess(state, action) {
      const { advisorId } = action.payload;

      const deleteAdvisorById = deleteProperty(state.byId, advisorId);
      const deleteAdvisorAllIds = filter(state.allIds, (id) => id !== advisorId);

      return {
        ...state,
        isLoading: false,
        byId: deleteAdvisorById,
        allIds: deleteAdvisorAllIds,
      };
    },

    // REINVITE ADVISOR
    reinviteAdvisorSuccess(state) {
      return {
        ...state,
        isLoading: false,
      };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  createAdvisorSuccess,
  updateAdvisorSuccess,
  deleteAdvisorSuccess,
  reinviteAdvisorSuccess,
} = slice.actions;

export function getAdvisors() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/advisors`, {});
      dispatch(slice.actions.getAdvisorsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ADVISORS slice in the getAdvisors function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function createAdvisor(newAdvisor: Partial<Omit<AdvisorManager, 'id'>>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', '/advisors', {
      body: newAdvisor,
    });
    dispatch(slice.actions.createAdvisorSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ADVISORS slice in the createAdvisor function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateAdvisor(advisorId: string, updateAdvisor: Partial<AdvisorManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put('bitsybackendv2', `/advisors/${advisorId}`, {
      body: updateAdvisor,
    });
    dispatch(slice.actions.updateAdvisorSuccess({ advisorId, updateAdvisor }));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ADVISORS slice in the updateAdvisor function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function deleteAdvisor(advisorId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.del('bitsybackendv2', `/advisors/${advisorId}`, {});
    dispatch(slice.actions.deleteAdvisorSuccess({ advisorId }));
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ADVISORS slice in the deleteAdvisor function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function reinviteAdvisor(advisorId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/reinvite`, {
      type: 'advisor',
      id: advisorId,
    });
    dispatch(slice.actions.reinviteAdvisorSuccess());
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ADVISORS slice in the reinviteAdvisor function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
