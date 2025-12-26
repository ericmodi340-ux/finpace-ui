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
  orionAccounts: [],
};

const slice = createSlice({
  name: 'firm-integrations',
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
    getFirmIntegrationsSuccess(state, action) {
      const integrations = action.payload;

      return {
        ...state,
        isLoading: false,
        integrations,
      };
    },

    getOrionAccountsSuccess(state, action) {
      const accounts = action.payload;

      return {
        ...state,
        isLoading: false,
        orionAccounts: accounts,
      };
    },

    // CREATE INTEGRATION
    createFirmIntegrationSuccess(state, action) {
      const newIntegration = action.payload;

      return {
        ...state,
        isLoading: false,
        integrations: [...state.integrations, newIntegration],
      };
    },

    // UPDATE INTEGRATION
    updateFirmIntegrationSuccess(state, action) {
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
    deleteFirmIntegrationSuccess(state, action) {
      const { id } = action.payload;
      const deleteIntegrations = filter(state.integrations, (integration) => integration.id !== id);

      return {
        ...state,
        isLoading: false,
        integrations: deleteIntegrations,
      };
    },

    // GET INTEGRATIONS FIELDS
    getFirmIntegrationsFieldsSuccess(state, action) {
      const integrationsFields = action.payload;

      return {
        ...state,
        isLoading: false,
        integrationsFields,
      };
    },

    // GET INTEGRATIONS FIELDS BY TYPE
    getFirmIntegrationsFieldsByTypeSuccess(state, action) {
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
    updateFirmIntegrationsFieldsSuccess(state, action) {
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

export function getFirmIntegrations(firmId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/firms/${firmId}/integrations`, {});
      dispatch(slice.actions.getFirmIntegrationsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in INTEGRATIONSFIRM slice in the getFirmIntegrations function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function createFirmIntegration(firmId: string, newIntegration: NewIntegrationConfig) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/firms/${firmId}/integrations`, {
      body: newIntegration,
    });
    dispatch(slice.actions.createFirmIntegrationSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in INTEGRATIONSFIRM slice in the createFirmIntegration function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateFirmIntegration(
  firmId: string,
  integrationType: IntegrationServiceId,
  updateIntegration: Partial<NewIntegrationConfig>
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put(
      'bitsybackendv2',
      `/firms/${firmId}/integrations/${integrationType}`,
      {
        body: updateIntegration,
      }
    );
    dispatch(slice.actions.updateFirmIntegrationSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in INTEGRATIONSFIRM slice in the updateFirmIntegration function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function deleteFirmIntegration(firmId: string, integrationType: IntegrationServiceId) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.del(
      'bitsybackendv2',
      `/firms/${firmId}/integrations/${integrationType}`,
      {}
    );
    dispatch(slice.actions.deleteFirmIntegrationSuccess({ id: integrationType }));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in INTEGRATIONSFIRM slice in the deleteFirmIntegration function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export function getFirmIntegrationsFields(firmId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/firms/${firmId}/integration-fields`, {});
      dispatch(slice.actions.getFirmIntegrationsFieldsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in INTEGRATIONSFIRM slice in the getFirmIntegrationsFields function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function getFirmIntegrationFields(
  firmId: string,
  integrationType: IntegrationServiceId
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get(
      'bitsybackendv2',
      `/firms/${firmId}/integration-fields/${integrationType}`,
      {}
    );
    dispatch(
      slice.actions.getFirmIntegrationsFieldsByTypeSuccess({
        integrationType,
        integrationFields: response,
      })
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in INTEGRATIONSFIRM slice in the getFirmIntegrationFields function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateFirmIntegrationsFieldsMapping(
  firmId: string,
  integrationType: IntegrationServiceId,
  updateMapping: NewIntegrationsFieldMappingConfig
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put(
      'bitsybackendv2',
      `/firms/${firmId}/integration-field-mappings/${integrationType}`,
      {
        body: { fields: updateMapping },
      }
    );
    dispatch(
      slice.actions.updateFirmIntegrationsFieldsSuccess({
        integrationType,
        updateMapping: response,
      })
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context:
          'Error in INTEGRATIONSFIRM slice in the updateFirmIntegrationsFieldsMapping function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function getOrionAccounts(firmId: string, email: string, secondaryEmail?: string) {
  dispatch(slice.actions.startLoading());

  let url = `/v2/firms/${firmId}/orion/accounts?primaryEmail=${encodeURIComponent(email)}`;
  if (secondaryEmail) {
    url = `${url}&secondaryEmail=${encodeURIComponent(secondaryEmail)}`;
  }

  try {
    const response: {
      accountType: string;
      currentValue: string;
      name: string;
      number: string;
    }[] = await API.get('bitsybackendv2', url, {});
    dispatch(slice.actions.getOrionAccountsSuccess(response));
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in INTEGRATIONSFIRM slice in the getOrionAccounts function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}
