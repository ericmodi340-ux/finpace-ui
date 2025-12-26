import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// actions
import { dispatch } from '../store';
import { ActivityLogState } from '../../@types/activityLog';

// ----------------------------------------------------------------------

const initialState: ActivityLogState = {
  isLoading: false,
  error: null,
  advisorActivityLogs: [],
  firmActivityLogs: [],
  activityLog: null,
};

const slice = createSlice({
  name: 'activityLogs',
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

    // GET INTEGRATIONS
    getAdvisorActivityLogsSuccess(state, action) {
      const advisorActivityLogs = action.payload;

      return {
        ...state,
        isLoading: false,
        advisorActivityLogs,
      };
    },
    // GET INTEGRATIONS
    getAdvisorActivityLogByIdSuccess(state, action) {
      const activityLog = action.payload;

      return {
        ...state,
        isLoading: false,
        activityLog,
      };
    },
    getFirmActivityLogsSuccess(state, action) {
      const firmActivityLogs = action.payload;

      return {
        ...state,
        isLoading: false,
        firmActivityLogs,
      };
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getAdvisorActivityLogs({
  advisorId,
  startDate,
  endDate,
}: {
  advisorId: string;
  startDate?: Date | null;
  endDate?: Date | null;
}) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get(
        'bitsybackendv2',
        `/v2/advisors/${advisorId}/activity-logs${
          startDate && endDate
            ? `?startTime=${startDate.getTime()}&endTime=${endDate.getTime()}`
            : ''
        }`,
        {}
      );
      dispatch(slice.actions.getAdvisorActivityLogsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ACTIVITY LOG slice in the getAdvisorActivityLogs function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getAdvisorActivityLogById({
  advisorId,
  logId,
}: {
  advisorId: string;
  logId: string;
}) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get(
        'bitsybackendv2',
        `/v2/advisors/${advisorId}/activity-logs/${logId}`,
        {}
      );
      dispatch(slice.actions.getAdvisorActivityLogByIdSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ACTIVITY LOG slice in the getAdvisorActivityLogById function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getFirmActivityLogs({
  firmId,
  startDate,
  endDate,
}: {
  firmId: string;
  startDate?: Date | null;
  endDate?: Date | null;
}) {
  return async () => {
    dispatch(slice.actions.startLoading());

    try {
      const response = await API.get(
        'bitsybackendv2',
        `/v2/firms/${firmId}/activity-logs${
          startDate && endDate
            ? `?startTime=${startDate.getTime()}&endTime=${endDate.getTime()}`
            : ''
        }`,
        {}
      );
      dispatch(slice.actions.getFirmActivityLogsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ACTIVITY LOG slice in the getFirmActivityLogs function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getFirmActivityLogById({ firm, logId }: { firm: string; logId: string }) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get(
        'bitsybackendv2',
        `/v2/firms/${firm}/activity-logs/${logId}`,
        {}
      );
      dispatch(slice.actions.getAdvisorActivityLogByIdSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ACTIVITY LOG slice in the getFirmActivityLogById function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function exportFirmActivityLogs({ firm }: { firm: string }) {
  return async () => {
    try {
      const response = await API.post(
        'bitsybackendv2',
        `/v2/firms/${firm}/activity-logs/export`,
        {}
      );
      return response;
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ACTIVITY LOG slice in the exportFirmActivityLogs function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function exportAdvisorActivityLogs({ advisorId }: { advisorId: string }) {
  return async () => {
    try {
      const response = await API.post(
        'bitsybackendv2',
        `/v2/advisors/${advisorId}/activity-logs/export`,
        {}
      );
      return response;
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ACTIVITY LOG slice in the exportAdvisorActivityLogs function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}
