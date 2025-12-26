import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';

// @types
import { FirmState, FirmManager } from '../../@types/firm';
// config
import { API_BASE } from 'config';
// utils
import axios from 'utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: FirmState = {
  isLoading: false,
  error: null,
  showBillingModal: false,
  stripeCheckoutSuccess: false,
  firm: {
    id: '',
    name: '',
    email: '',
    hideDisclosuresOnClientProfile: false,
    isInactive: false,
    isVerified: false,
    onHold: false,
  },
};

const slice = createSlice({
  name: 'firm',
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

    // GET FIRM
    getFirmSuccess(state, action) {
      state.isLoading = false;
      state.firm = { ...state.firm, ...action.payload };
    },

    // // CREATE FIRM
    // createFirmSuccess(state, action) {
    //   const newFirm = action.payload;
    //   state.isLoading = false;
    //   state.firm = { ...state.firm, ...newFirm };
    // },

    // UPDATE FIRM
    updateFirmSuccess(state, action) {
      const updateFirm = action.payload;
      state.isLoading = false;
      state.firm = { ...state.firm, ...updateFirm };
    },

    // SHOW BILLING PORTAL
    setShowBilling(state, action) {
      state.showBillingModal = action.payload;
    },

    // SHOW BILLING PORTAL
    setStripeCheckoutSuccess(state, action) {
      state.stripeCheckoutSuccess = action.payload;
    },

    exportDataSuccess(state) {
      state.isLoading = false;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { updateFirmSuccess, setShowBilling, setStripeCheckoutSuccess, exportDataSuccess } =
  slice.actions;

// ----------------------------------------------------------------------

export function getFirm(firmId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/firms/${firmId}`, {});
      dispatch(slice.actions.getFirmSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in FIRM slice in the getFirm function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getFirmPublic(firmId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get(`${API_BASE}/public/firms/${firmId}`);
      dispatch(slice.actions.getFirmSuccess(response.data));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in FIRM slice in the getFirmPublic function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function updateFirm(firmId: string, updateFirm: Partial<FirmManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put('bitsybackendv2', `/firms/${firmId}`, {
      body: {
        firm: updateFirm,
      },
    });
    dispatch(slice.actions.updateFirmSuccess(updateFirm));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FIRM slice in the updateFirm function',
      },
    });
    console.error(error);
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function exportData(firmId: string, data: any) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/v2/firms/${firmId}/export`, {
      body: data,
    });
    dispatch(slice.actions.exportDataSuccess());
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FIRM slice in the exportData function',
      },
    });
    console.error(error);
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
