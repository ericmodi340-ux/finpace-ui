import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import { AdvisorState, AdvisorManager } from '../../@types/advisor';
// config
import { API_BASE } from 'config';
// utils
import axios from 'utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: AdvisorState = {
  isLoading: false,
  error: null,
  advisor: null,
};

const slice = createSlice({
  name: 'advisor',
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

    // GET ADVISOR
    getAdvisorSuccess(state, action) {
      state.isLoading = false;
      state.advisor = { ...state.advisor, ...action.payload };
    },

    // UPDATE ADVISOR
    updateAdvisorSuccess(state, action) {
      const updateAdvisor = action.payload;
      state.isLoading = false;
      state.advisor = { ...state.advisor, ...updateAdvisor };
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getAdvisor(advisorId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/advisors/${advisorId}`, {});
      dispatch(slice.actions.getAdvisorSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ADVISOR slice in the getAdvisor function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getAdvisorPublic(advisorId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get(`${API_BASE}/public/advisors/${advisorId}`);
      dispatch(slice.actions.getAdvisorSuccess(response.data));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ADVISOR slice in the getAdvisorPublic function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function updateAdvisor(advisorId: string, updateAdvisor: Partial<AdvisorManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put('bitsybackendv2', `/advisors/${advisorId}`, {
      body: updateAdvisor,
    });
    dispatch(slice.actions.updateAdvisorSuccess(response));
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ADVISOR slice in the updateAdvisor function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
