import { filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import { FirmAdminManager, FirmAdminsState } from '../../@types/firmAdmin';
// utils
import objFromArray from 'utils/objFromArray';
import deleteProperty from 'utils/deleteProperty';
//
import { dispatch } from '../store';
import { SendSmsType } from '../../@types/sms';

// ----------------------------------------------------------------------

const initialState: FirmAdminsState = {
  isLoading: false,
  error: null,
  byId: {},
  allIds: [],
  sms: [],
};

const slice = createSlice({
  name: 'firmAdmins',
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

    // GET FIRM ADMINS
    getFirmAdminsSuccess(state, action) {
      const firmAdmins = action.payload;

      const firmAdminsObj = objFromArray(firmAdmins);

      return {
        ...state,
        isLoading: false,
        byId: firmAdminsObj,
        allIds: Object.keys(firmAdminsObj),
      };
    },

    // CREATE FIRM ADMIN
    createFirmAdminSuccess(state, action) {
      const newFirmAdmin = action.payload;
      const { id } = newFirmAdmin;
      return {
        ...state,
        isLoading: false,
        byId: {
          ...state.byId,
          [id]: newFirmAdmin,
        },
        //If not exist FirmAdmin in state then add its id
        allIds: state.allIds.includes(id) ? [...state.allIds] : [...state.allIds, id],
      };
    },

    // UPDATE FIRM ADMIN
    updateFirmAdminSuccess(state, action) {
      const { firmAdminId, updateFirmAdmin } = action.payload;
      state.isLoading = false;
      state.byId[firmAdminId] = { ...state.byId[firmAdminId], ...updateFirmAdmin };
    },

    // DELETE FIRM ADMIN
    deleteFirmAdminSuccess(state, action) {
      const { firmAdminId } = action.payload;

      const deleteFirmAdminById = deleteProperty(state.byId, firmAdminId);
      const deleteFirmAdminAllIds = filter(state.allIds, (id) => id !== firmAdminId);

      return {
        ...state,
        isLoading: false,
        byId: deleteFirmAdminById,
        allIds: deleteFirmAdminAllIds,
      };
    },

    // REINVITE FIRM AMDIN
    reinviteFirmAdminSuccess(state) {
      return {
        ...state,
        isLoading: false,
      };
    },

    // ADD SMS MESSAGE TO FIRMADMIN
    publishSmsSuccess(state, action) {
      const { message } = action.payload;

      return {
        ...state,
        isLoading: false,
        sms: [...state.sms, message],
      };
    },

    getSmsSuccess(state, action) {
      return {
        ...state,
        isLoading: false,
        sms: action.payload,
      };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  createFirmAdminSuccess,
  updateFirmAdminSuccess,
  deleteFirmAdminSuccess,
  reinviteFirmAdminSuccess,
  publishSmsSuccess,
  getSmsSuccess,
} = slice.actions;

// ----------------------------------------------------------------------

export function getFirmAdmins() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/firm-admins`, {});
      dispatch(slice.actions.getFirmAdminsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in FIRMADMINS slice in the getFirmAdmins function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function createFirmAdmin(newFirmAdmin: Partial<Omit<FirmAdminManager, 'id'>>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', '/firm-admins', {
      body: newFirmAdmin,
    });
    dispatch(slice.actions.createFirmAdminSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FIRMADMINS slice in the createFirmAdmin function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateFirmAdmin(
  firmAdminId: string,
  updateFirmAdmin: Partial<FirmAdminManager>
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put('bitsybackendv2', `/firm-admins/${firmAdminId}`, {
      body: updateFirmAdmin,
    });
    dispatch(slice.actions.updateFirmAdminSuccess({ firmAdminId, updateFirmAdmin: response }));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FIRMADMINS slice in the updateFirmAdmin function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function deleteFirmAdmin(firmAdminId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.del('bitsybackendv2', `/firm-admins/${firmAdminId}`, {});
    dispatch(slice.actions.deleteFirmAdminSuccess({ firmAdminId }));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FIRMADMINS slice in the deleteFirmAdmin function',
      },
    });
    console.error(error);
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function reinviteFirmAdmin(firmAdminId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/reinvite`, {
      type: 'firm-admin',
      id: firmAdminId,
    });
    dispatch(slice.actions.reinviteFirmAdminSuccess());
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FIRMADMINS slice in the reinviteFirmAdmin function',
      },
    });
    console.error(error);
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function publishSms(sms: SendSmsType) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/sms`, {
      body: sms,
    });
    dispatch(slice.actions.publishSmsSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FIRMADMINS slice in the publishSms function',
      },
    });
    console.error(error);
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function getSms(recipientId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get('bitsybackendv2', `/sms/${recipientId}`, {});
    dispatch(slice.actions.getSmsSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FIRMADMINS slice in the getSms function',
      },
    });
    console.error(error);
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
