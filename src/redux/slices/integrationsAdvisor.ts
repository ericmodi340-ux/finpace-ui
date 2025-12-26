import { map, filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import {
  IntegrationsState,
  NewIntegrationConfig,
  NewIntegrationsFieldMappingConfig,
  IntegrationServiceId,
} from '../../@types/integration';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: IntegrationsState = {
  isLoading: false,
  error: null,
  integrations: [],
  integrationsFields: {},
};

const slice = createSlice({
  name: 'advisor-integrations',
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
    getAdvisorIntegrationsSuccess(state, action) {
      const integrations = action.payload;

      return {
        ...state,
        isLoading: false,
        integrations,
      };
    },

    // CREATE INTEGRATION
    createAdvisorIntegrationSuccess(state, action) {
      const newIntegration = action.payload;

      return {
        ...state,
        isLoading: false,
        integrations: [...state.integrations, newIntegration],
      };
    },

    // UPDATE INTEGRATION
    updateAdvisorIntegrationSuccess(state, action) {
      const updateIntegration = action.payload;
      const updateIntegrations = map(state.integrations, (_integration) => {
        if (_integration.id === updateIntegration.id) {
          return updateIntegration;
        }
        return _integration;
      });

      state.isLoading = false;
      state.integrations = updateIntegrations;
    },

    // DELETE INTEGRATION
    deleteAdvisorIntegrationSuccess(state, action) {
      const { id } = action.payload;
      const deleteIntegrations = filter(state.integrations, (integration) => integration.id !== id);

      return {
        ...state,
        isLoading: false,
        integrations: deleteIntegrations,
      };
    },

    // GET INTEGRATIONS FIELDS
    getAdvisorIntegrationsFieldsSuccess(state, action) {
      const integrationsFields = action.payload;

      return {
        ...state,
        isLoading: false,
        integrationsFields,
      };
    },

    // GET INTEGRATIONS FIELDS BY TYPE
    getAdvisorIntegrationsFieldsByTypeSuccess(state, action) {
      const { integrationType, integrationFields } = action.payload;

      return {
        ...state,
        isLoading: false,
        integrationsFields: {
          ...state.integrationsFields,
          [integrationType]: integrationFields,
        },
      };
    },

    // UPDATE INTEGRATION FIELDS
    updateAdvisorIntegrationsFieldsSuccess(state, action) {
      const { integrationType, updateMapping } = action.payload;
      const updateIntegrations = map(state.integrations, (_integration) => {
        if (_integration.id === integrationType) {
          return { ..._integration, fields: updateMapping };
        }
        return _integration;
      });

      state.isLoading = false;
      state.integrations = updateIntegrations;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getAdvisorIntegrations(advisorId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/advisors/${advisorId}/integrations`, {});
      dispatch(slice.actions.getAdvisorIntegrationsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in INTEGRATIONSADVISOR slice in the getAdvisorIntegrations function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function createAdvisorIntegration(
  advisorId: string,
  newIntegration: NewIntegrationConfig
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/advisors/${advisorId}/integrations`, {
      body: newIntegration,
    });
    dispatch(slice.actions.createAdvisorIntegrationSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in INTEGRATIONSADVISOR slice in the createAdvisorIntegration function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateAdvisorIntegration(
  advisorId: string,
  integrationType: IntegrationServiceId,
  updateIntegration: Partial<NewIntegrationConfig>
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put(
      'bitsybackendv2',
      `/advisors/${advisorId}/integrations/${integrationType}`,
      {
        body: updateIntegration,
      }
    );
    dispatch(slice.actions.updateAdvisorIntegrationSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in INTEGRATIONSADVISOR slice in the updateAdvisorIntegration function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function deleteAdvisorIntegration(
  advisorId: string,
  integrationType: IntegrationServiceId
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.del(
      'bitsybackendv2',
      `/advisors/${advisorId}/integrations/${integrationType}`,
      {}
    );
    dispatch(slice.actions.deleteAdvisorIntegrationSuccess({ id: integrationType }));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in INTEGRATIONSADVISOR slice in the deleteAdvisorIntegration function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export function getAdvisorIntegrationsFields(advisorId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get(
        'bitsybackendv2',
        `/advisors/${advisorId}/integration-fields`,
        {}
      );
      dispatch(slice.actions.getAdvisorIntegrationsFieldsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context:
            'Error in INTEGRATIONSADVISOR slice in the getAdvisorIntegrationsFields function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function getAdvisorIntegrationFields(
  advisorId: string,
  integrationType: IntegrationServiceId
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get(
      'bitsybackendv2',
      `/advisors/${advisorId}/integration-fields/${integrationType}`,
      {}
    );
    dispatch(
      slice.actions.getAdvisorIntegrationsFieldsByTypeSuccess({
        integrationType,
        integrationFields: response,
      })
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in INTEGRATIONSADVISOR slice in the getAdvisorIntegrationFields function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateAdvisorIntegrationsFieldsMapping(
  advisorId: string,
  integrationType: IntegrationServiceId,
  updateMapping: NewIntegrationsFieldMappingConfig
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put(
      'bitsybackendv2',
      `/advisors/${advisorId}/integration-field-mappings/${integrationType}`,
      {
        body: { fields: updateMapping },
      }
    );
    dispatch(
      slice.actions.updateAdvisorIntegrationsFieldsSuccess({
        integrationType,
        updateMapping: response,
      })
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context:
          'Error in INTEGRATIONSADVISOR slice in the updateAdvisorIntegrationsFieldsMapping function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
