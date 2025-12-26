import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import objFromArray from 'utils/objFromArray';
import * as Sentry from '@sentry/react';
// @types
import {
  FormManager,
  FormsState,
  CreatePublicFormPayload,
  CreatePublicFormResponse,
} from '../../@types/form';
//
import { dispatch } from '../store';
import { API_BASE } from 'config';
import { cloneDeep } from 'lodash';

// ----------------------------------------------------------------------

const initialState: FormsState = {
  isLoading: false,
  error: null,
  byId: {},
  allIds: [],
  loaded: false,
};

const slice = createSlice({
  name: 'forms',
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

    // GET FORM
    getFormSuccess(state, action) {
      const { id, ...fullForm } = action.payload;

      return {
        ...state,
        isLoading: false,
        byId: {
          ...state.byId,
          [id]: { ...state.byId[id], ...fullForm },
        },
      };
    },

    // GET FORMS
    getFormsSuccess(state, action) {
      const forms = action.payload;

      const formsObj = objFromArray(forms);

      return {
        ...state,
        isLoading: false,
        byId: formsObj,
        allIds: Object.keys(formsObj),
        loaded: true,
      };
    },

    // GET CLIENT FORMS
    getClientFormsSuccess(state) {
      state.isLoading = false;
    },

    // CREATE FORM
    createFormSuccess(state, action) {
      const newForm = action.payload;
      const { id } = newForm;
      return {
        ...state,
        isLoading: false,
        byId: {
          ...state.byId,
          [id]: newForm,
        },
        //If not exist Form in state then add its id
        allIds: state.allIds.includes(id) ? [...state.allIds] : [...state.allIds, id],
      };
    },

    // UPDATE FORM
    updateFormSuccess(state, action) {
      const { id, ...updateForm } = action.payload;
      state.isLoading = false;
      state.byId[id] = { ...state.byId[id], ...updateForm };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { createFormSuccess, updateFormSuccess } = slice.actions;

// ----------------------------------------------------------------------

export function getForms() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/forms`, {});
      dispatch(slice.actions.getFormsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in FORM slice in the getForms function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function getForm(formId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get('bitsybackendv2', `/forms/${formId}`, {});
    dispatch(slice.actions.getFormSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FORM slice in the getForm function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}

export async function getClientForms(clientId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get('bitsybackendv2', `/clients/${clientId}/forms`, {});
    dispatch(slice.actions.getClientFormsSuccess());
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FORM slice in the getClientForms function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function createForm(newForm: Partial<FormManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', '/forms', {
      body: {
        form: newForm,
      },
    });
    dispatch(slice.actions.createFormSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FORM slice in the createForm function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateForm(
  formId: string,
  updateForm: Partial<FormManager>,
  shouldUpdateState = true
) {
  dispatch(slice.actions.startLoading());
  try {
    const dbForm = cloneDeep(updateForm);

    // Delete all base64 urls from schema.data before saving
    for (const templateKey in dbForm.submission) {
      for (const key in dbForm.submission?.[templateKey]) {
        if (key.startsWith('s3upload-')) {
          const val = dbForm.submission?.[templateKey][key];
          for (const i in val) {
            val[i].url = '';
          }
        }
      }
    }

    const response = await API.put('bitsybackendv2', `/forms/${formId}`, {
      body: {
        form: dbForm,
      },
    });
    const newResp = { ...response, ...dbForm };
    if (shouldUpdateState) {
      dispatch(slice.actions.updateFormSuccess(newResp));
    }
    return newResp;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FORM slice in the updateForm function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

// Public endpoints
// ----------------------------------------
// Add response type
export async function createPublicForm(
  values: CreatePublicFormPayload,
  captchaToken: string
): Promise<CreatePublicFormResponse> {
  dispatch(slice.actions.startLoading());
  try {
    const response = await fetch(`${API_BASE}/v2/forms/public/new`, {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json',
        Authorization: captchaToken,
      },
    });
    const data = await response.json();
    dispatch(slice.actions.createFormSuccess(data));
    return data;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FORM slice in the createPublicForm function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updatePublicForm(
  formId: string,
  updateForm: Partial<FormManager>,
  shouldUpdateState = true
): Promise<FormManager> {
  dispatch(slice.actions.startLoading());
  try {
    const dbForm = cloneDeep(updateForm);

    // Delete all base64 urls from schema.data before saving
    for (const templateKey in dbForm.submission) {
      for (const key in dbForm.submission?.[templateKey]) {
        if (key.startsWith('s3upload-')) {
          const val = dbForm.submission?.[templateKey][key];
          for (const i in val) {
            val[i].url = '';
          }
        }
      }
    }

    const response = await fetch(`${API_BASE}/v2/forms/public/edit/${formId}`, {
      method: 'PUT',
      body: JSON.stringify({
        form: dbForm,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const newResp = { ...data, ...updateForm };
    if (shouldUpdateState) {
      dispatch(slice.actions.updateFormSuccess(newResp));
    }
    return newResp;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in FORM slice in the updateForm function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
