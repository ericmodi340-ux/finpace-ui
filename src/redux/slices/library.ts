import { filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import { TemplateWithFieldsManager, TemplatesState } from '../../@types/template';
// utils
import objFromArray from 'utils/objFromArray';
import deleteProperty from 'utils/deleteProperty';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: TemplatesState = {
  isLoading: false,
  error: null,
  byId: {},
  allIds: [],
  fullTemplate: null,
};

const slice = createSlice({
  name: 'library',
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

    // GET TEMPLATE
    getTemplateSuccess(state, action) {
      const template = action.payload;

      return {
        ...state,
        isLoading: false,
        fullTemplate: template,
      };
    },

    // GET TEMPLATES
    getTemplatesSuccess(state, action) {
      const templates = action.payload;

      const templatesObj = objFromArray(templates);

      return {
        ...state,
        isLoading: false,
        byId: templatesObj,
        allIds: Object.keys(templatesObj),
      };
    },

    // CREATE TEMPLATE
    createTemplateSuccess(state) {
      return {
        ...state,
        isLoading: false,
        byId: {
          ...state.byId,
        },
      };
    },

    // UPDATE TEMPLATE
    updateTemplateSuccess(state, action) {
      const { id, ...updateTemplate } = action.payload;
      state.isLoading = false;
      const updatedTemplate = { ...state.byId[id], ...updateTemplate };
      let updatedFullTemplate = state.fullTemplate;
      if (
        (state.fullTemplate?.id === id && Object.keys(updateTemplate).includes('fields')) ||
        (state.fullTemplate?.id === id && Object.keys(updateTemplate).includes('dsFieldMapping'))
        // * To be checked, was related to DEV-878 & DEV-902 & DEV-1042
        // state.fullTemplate?.dsTemplateId !== updatedTemplate?.dsTemplateId
      ) {
        console.log('updating full template');
        updatedFullTemplate = { ...state.fullTemplate, ...updateTemplate };
      }

      return {
        ...state,
        isLoading: false,
        byId: {
          ...state.byId,
          [id]: updatedTemplate,
        },
        fullTemplate: updatedFullTemplate,
      };
    },

    // DELETE TEMPLATE
    deleteTemplateSuccess(state, action) {
      const { templateId } = action.payload;

      const deleteTemplateById = deleteProperty(state.byId, templateId);
      const deleteTemplateAllIds = filter(state.allIds, (id) => id !== templateId);

      return {
        ...state,
        isLoading: false,
        byId: deleteTemplateById,
        allIds: deleteTemplateAllIds,
      };
    },

    // ORDER TEMPLATE
    orderTemplates(state, action) {
      const allIds = action.payload.sortOrder;
      return { ...state, allIds };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  createTemplateSuccess,
  updateTemplateSuccess,
  deleteTemplateSuccess,
  orderTemplates,
} = slice.actions;

// ----------------------------------------------------------------------

export async function getTemplate(templateId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get('bitsybackendv2', `/library-templates/${templateId}`, {});

    dispatch(slice.actions.getTemplateSuccess(response));

    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES LIBRARY slice in the getTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export function getTemplates() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/library-templates`, {});
      dispatch(slice.actions.getTemplatesSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in TEMPLATES LIBRARY slice in the getTemplates function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function createTemplate(newTemplate: Partial<TemplateWithFieldsManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', '/library-templates', {
      body: {
        template: newTemplate,
      },
    });
    dispatch(slice.actions.createTemplateSuccess());
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES LIBRARY slice in the createTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function importTemplate(templateId: any) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/library-templates/${templateId}`, {});
    dispatch(slice.actions.createTemplateSuccess());
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES LIBRARY slice in the importTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateTemplate(
  templateId: string,
  updateTemplate: Partial<TemplateWithFieldsManager>
) {
  try {
    // reflect changes on local state
    dispatch(slice.actions.updateTemplateSuccess({ id: templateId, ...updateTemplate }));
    dispatch(slice.actions.startLoading());
    const response = await API.put('bitsybackendv2', `/library-templates/${templateId}`, {
      body: {
        template: updateTemplate,
      },
    });
    dispatch(slice.actions.updateTemplateSuccess(response));
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES LIBRARY slice in the updateTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}

export async function deleteTemplate(templateId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.del('bitsybackendv2', `/library-templates/${templateId}`, {});
    dispatch(slice.actions.deleteTemplateSuccess({ templateId }));
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in LIBRARY TEMPLATES slice in the deleteTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
