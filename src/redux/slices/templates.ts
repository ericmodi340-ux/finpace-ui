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
import { API_BASE_FULL_URL } from 'config';

// ----------------------------------------------------------------------

const initialState: TemplatesState = {
  isLoading: false,
  error: null,
  byId: {},
  allIds: [],
  fullTemplate: null,
  loaded: false,
};

const slice = createSlice({
  name: 'templates',
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
        byId: {
          ...state.byId,
          [template.id]: template,
        },
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
        loaded: true,
      };
    },

    // CREATE TEMPLATE
    createTemplateSuccess(state, action) {
      const newTemplate = action.payload;
      const { id } = newTemplate;
      return {
        ...state,
        isLoading: false,
        byId: {
          ...state.byId,
          [id]: newTemplate,
        },
        //If not exist Template in state then add its id
        allIds: state.allIds.includes(id) ? [...state.allIds] : [...state.allIds, id],
      };
    },

    // UPDATE TEMPLATE
    updateTemplateSuccess(state, action) {
      const { id, ...updateTemplate } = action.payload;
      const updatedTemplate = { ...state.byId[id], ...updateTemplate };

      let updatedFullTemplate = state.fullTemplate;
      if (
        (state.fullTemplate?.id === id && Object.keys(updateTemplate).includes('fields')) ||
        (state.fullTemplate?.id === id && Object.keys(updateTemplate).includes('dsFieldMapping'))
        // * To be checked, was related to DEV-878 & DEV-902 & DEV-1042
        // state.fullTemplate?.dsTemplateId !== updatedTemplate?.dsTemplateId
      ) {
        updatedFullTemplate = { ...state.fullTemplate, ...updateTemplate };
      }

      return {
        ...state,
        isLoading: false,
        byId: {
          ...state.byId,
          [id]: updatedTemplate,
        },
        fullTemplate: {
          ...updatedFullTemplate,
          ...updatedTemplate,
        },
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

    // Remove Full Template Signer
    removeFullTemplateSigner(state, action) {
      const signerToRemove = action.payload;
      const signers = state.fullTemplate?.signers ? [...state.fullTemplate?.signers] : [];
      const updatedSigners = signers.filter((signer) => signer.type !== signerToRemove.name);
      return {
        ...state,
        fullTemplate: { ...(state.fullTemplate as any), signers: updatedSigners, showRTE: true },
      };
    },

    // Add Full Template Signer
    addFullTemplateSigner(state, action) {
      const newSigner = action.payload;
      const signers = state.fullTemplate?.signers ? [...state.fullTemplate?.signers] : [];
      signers.push(newSigner);

      return {
        ...state,
        fullTemplate: { ...(state.fullTemplate as any), signers },
      };
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
  removeFullTemplateSigner,
  addFullTemplateSigner,
  orderTemplates,
} = slice.actions;

// ----------------------------------------------------------------------

export async function getTemplate(templateId: string, updateState: boolean = false) {
  dispatch(slice.actions.startLoading());
  try {
    const response: TemplateWithFieldsManager = await API.get(
      'bitsybackendv2',
      `/templates/${templateId}`,
      {}
    );
    if (updateState) {
      dispatch(slice.actions.getTemplateSuccess(response));
    } else {
      dispatch(slice.actions.stopLoading());
    }
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES slice in the getTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

// ----------------------------------------------------------------------

export function getTemplates() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/templates`, {});
      dispatch(slice.actions.getTemplatesSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in TEMPLATES slice in the getTemplates function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function getPublicTemplate({
  templateId,
  firmId,
}: {
  templateId: string;
  firmId: string;
}) {
  try {
    const response = await fetch(
      API_BASE_FULL_URL + `/public/firms/${firmId}/templates/${templateId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error('Error in fetching public template');
    }
    return await response.json();
  } catch (error) {
    console.log('error', error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES slice in the getPublicTemplate function',
      },
    });
  }
}

// ----------------------------------------------------------------------

export async function createTemplate(newTemplate: Partial<TemplateWithFieldsManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', '/templates', {
      body: {
        template: newTemplate,
      },
    });
    dispatch(slice.actions.createTemplateSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES slice in the createTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}

// ----------------------------------------------------------------------

export async function updateTemplate(
  templateId: string,
  updateTemplate: Partial<TemplateWithFieldsManager>
) {
  try {
    dispatch(slice.actions.startLoading());
    const response = await API.put('bitsybackendv2', `/templates/${templateId}`, {
      body: {
        template: updateTemplate,
      },
    });
    dispatch(slice.actions.updateTemplateSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES slice in the updateTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}

// ----------------------------------------------------------------------

export async function deleteTemplate(templateId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.del('bitsybackendv2', `/templates/${templateId}`, {});
    dispatch(slice.actions.deleteTemplateSuccess({ templateId }));
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES slice in the deleteTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function getTemplateFields() {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get('bitsybackendv2', `/templates-fields`, {});
    dispatch(slice.actions.stopLoading());
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES slice in the getTemplateFields function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function getTemplateFieldsById(templateId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get('bitsybackendv2', `/templates-fields/${templateId}`, {});
    dispatch(slice.actions.stopLoading());
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES slice in the getTemplateFieldsById function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
