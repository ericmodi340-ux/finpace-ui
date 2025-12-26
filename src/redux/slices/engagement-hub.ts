import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
//
import { dispatch } from '../store';
import { EmailTemplateWithAllFields, EngagementHubState } from '../../@types/engagementHub';

// ----------------------------------------------------------------------

const initialState: EngagementHubState = {
  isLoading: false,
  error: null,
  currentTemplate: null,
  emailTemplates: [],
  loaded: false,
};

const slice = createSlice({
  name: 'engagementhub',
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
      state.loaded = true;
    },

    // GET Email TEMPLATE
    getEmailTemplateSuccess(state, action) {
      const emailTemplate = action.payload;

      return {
        ...state,
        isLoading: false,
        currentTemplate: emailTemplate,
      };
    },

    // GET TEMPLATES
    getEmailTemplatesSuccess(state, action) {
      const emailTemplates = action.payload;

      return {
        ...state,
        isLoading: false,
        emailTemplates,
        loaded: true,
      };
    },

    // CREATE TEMPLATE
    createEmailTemplateSuccess(state, action) {
      const emailTemplate = action.payload;

      return {
        ...state,
        isLoading: false,
        emailTemplates: [...state.emailTemplates, emailTemplate],
      };
    },

    // UPDATE TEMPLATE
    updateEmailTemplateSuccess(state, action) {
      const { emailTemplateId, ...updateTemplate } = action.payload;
      state.isLoading = false;
      state.error = null;

      const index = state.emailTemplates.findIndex(
        (template) => template.emailTemplateId === emailTemplateId
      );

      if (index !== -1) {
        state.emailTemplates[index] = { ...state.emailTemplates[index], ...updateTemplate };
      }

      if (emailTemplateId === state.currentTemplate?.emailTemplateId) {
        state.currentTemplate = { ...state.currentTemplate, ...updateTemplate };
      }
    },

    // DELETE TEMPLATE
    deleteEmailTemplateSuccess(state, action) {
      const emailTemplateId = action.payload;
      const newTemplates = state.emailTemplates.filter(
        (template) => template.emailTemplateId !== emailTemplateId
      );
      return { ...state, isLoading: false, emailTemplates: newTemplates };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  getEmailTemplateSuccess,
  getEmailTemplatesSuccess,
  createEmailTemplateSuccess,
  updateEmailTemplateSuccess,
  deleteEmailTemplateSuccess,
} = slice.actions;

// ----------------------------------------------------------------------

export async function getEmailTemplate(advisorId: string, emailTemplateId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get(
      'bitsybackendv2',
      `/v2/advisors/${advisorId}/email-templates/${emailTemplateId}`,
      {}
    );

    dispatch(slice.actions.getEmailTemplateSuccess(response));

    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ENGAGEMENTHUB slice in the getEmailTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export function getEmailTemplates(advisorId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get(
        'bitsybackendv2',
        `/v2/advisors/${advisorId}/email-templates`,
        {}
      );
      dispatch(slice.actions.getEmailTemplatesSuccess(response));
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

export async function createEmailTemplate(
  advisorId: string,
  newTemplate: Partial<EmailTemplateWithAllFields>
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/v2/advisors/${advisorId}/email-templates`, {
      body: {
        ...newTemplate,
      },
    });
    dispatch(slice.actions.createEmailTemplateSuccess({ ...newTemplate, ...response }));
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

export async function sendBulkEmail({
  advisorId,
  templateId,
  data,
}: {
  advisorId: string;
  templateId: string;
  data: any;
}) {
  try {
    const response = await API.post(
      'bitsybackendv2',
      `/v2/advisors/${advisorId}/email-templates/${templateId}/bulk-send`,
      {
        body: data,
      }
    );
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

export async function updateEmailTemplate(
  advisorId: string,
  templateId: string,
  updateTemplate: Partial<EmailTemplateWithAllFields>
) {
  try {
    dispatch(slice.actions.startLoading());
    const response = await API.put(
      'bitsybackendv2',
      `/v2/advisors/${advisorId}/email-templates/${templateId}`,
      {
        body: {
          ...updateTemplate,
        },
      }
    );
    dispatch(slice.actions.updateEmailTemplateSuccess(response));
    return response;
  } catch (error) {
    console.log(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in TEMPLATES LIBRARY slice in the updateEmailTemplate function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}

export async function deleteEmailTemplate(advisorId: string, templateId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.del(
      'bitsybackendv2',
      `/v2/advisors/${advisorId}/email-templates/${templateId}`,
      {}
    );
    dispatch(slice.actions.deleteEmailTemplateSuccess(templateId));
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

export async function shareTemplateWithAdvisor({
  advisorId,
  templateId,
  advisors,
}: {
  advisorId: string;
  templateId: string;
  advisors: string[];
}) {
  try {
    const response = await API.post(
      'bitsybackendv2',
      `/v2/advisors/${advisorId}/email-templates/${templateId}/clone`,
      {
        body: {
          advisors: advisors,
        },
      }
    );
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
