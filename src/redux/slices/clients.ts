import { cloneDeep, filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import { ClientManager, ClientsState } from '../../@types/client';
import { IntegrationServiceId, IntegrationOwner } from '../../@types/integration';
// utils
import objFromArray from 'utils/objFromArray';
import deleteProperty from 'utils/deleteProperty';
//
import { dispatch } from '../store';
import { API_BASE } from 'config';

// ----------------------------------------------------------------------

const initialState: ClientsState = {
  isLoading: false,
  error: null,
  byId: {},
  allIds: [],
};

const slice = createSlice({
  name: 'clients',
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

    // RESET CLIENTS
    resetClients(state) {
      return {
        ...state,
        ...initialState,
      };
    },

    // GET CLIENTS
    getClientsSuccess(state, action) {
      const clients = action.payload;

      const clientsObj = objFromArray(clients);

      return {
        ...state,
        isLoading: false,
        byId: clientsObj,
        allIds: Object.keys(clientsObj),
      };
    },

    // CREATE CLIENT
    createClientSuccess(state, action) {
      const newClient = action.payload;
      const { id } = newClient;
      return {
        ...state,
        isLoading: false,
        byId: {
          ...state.byId,
          [id]: newClient,
        },
        //If not exist Client in state then add its id
        allIds: state.allIds.includes(id) ? [...state.allIds] : [...state.allIds, id],
      };
    },

    // UPDATE CLIENT
    updateClientSuccess(state, action) {
      const { clientId, updateClient } = action.payload;
      state.isLoading = false;
      state.byId[clientId] = { ...state.byId[clientId], ...cloneDeep(updateClient) };
    },

    // DELETE CLIENT
    deleteClientSuccess(state, action) {
      const { clientId } = action.payload;

      const deleteClientById = deleteProperty(state.byId, clientId);
      const deleteClientAllIds = filter(state.allIds, (id) => id !== clientId);

      return {
        ...state,
        isLoading: false,
        byId: deleteClientById,
        allIds: deleteClientAllIds,
      };
    },

    // REINVITE CLIENT
    reinviteClientSuccess(state) {
      return {
        ...state,
        isLoading: false,
      };
    },

    // NOTE SHARED WITH CLIENT
    shareNoteWithClientSuccess(state) {
      return {
        ...state,
        isLoading: false,
      };
    },

    // GET CLIENT BY ID
    getClientByIdSuccess(state, action) {
      const client = action.payload;
      const { id } = client;
      state.isLoading = false;
      state.byId[id] = client;
      if (!state.allIds.includes(id)) {
        state.allIds.push(id);
      }
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  createClientSuccess,
  updateClientSuccess,
  deleteClientSuccess,
  reinviteClientSuccess,
  resetClients,
  shareNoteWithClientSuccess,
} = slice.actions;

// ----------------------------------------------------------------------

export function getClients() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/v2/clients`, {});
      dispatch(slice.actions.getClientsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in CLIENTS slice in the getClients function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function getClientById(clientId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get('bitsybackendv2', `/v2/clients/${clientId}`, {});
    dispatch(slice.actions.getClientByIdSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the getClientById function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function createClient(newClient: Partial<ClientManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', '/clients', {
      body: newClient,
    });
    dispatch(slice.actions.createClientSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the createClient function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateClient(clientId: string, updateClient: Partial<ClientManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put('bitsybackendv2', `/clients/${clientId}`, {
      body: updateClient,
    });
    dispatch(
      slice.actions.updateClientSuccess({
        clientId,
        updateClient: response,
      })
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the updateClient function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateClientsTags(clientIds: string[], tags: string[]) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put('bitsybackendv2', `/v2/clients`, {
      body: {
        clientIds,
        tags,
      },
    });
    dispatch(slice.actions.stopLoading());
    // dispatch(slice.actions.updateClientSuccess({ clientId, updateClient }));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the updateClient function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function deleteClient(clientId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.del('bitsybackendv2', `/clients/${clientId}`, {});
    dispatch(slice.actions.deleteClientSuccess({ clientId }));
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the deleteClient function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function getClientFromIntegration({
  integrationType,
  integrationOwner,
  clientId,
  queryParams = {},
}: {
  integrationType: IntegrationServiceId;
  integrationOwner: IntegrationOwner;
  clientId: string;
  queryParams?: { [key: string]: any };
}) {
  try {
    const queryString = Object.keys(queryParams)
      .map((key) => key + '=' + queryParams[key])
      .join('&');

    const response = await API.get(
      'bitsybackendv2',
      `/clients/${clientId}/integrations/${integrationType}/values?integrationOwner=${integrationOwner}${
        queryString ? `&${queryString}` : ''
      }`,
      {}
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the getClientFromIntegration function',
      },
    });
    console.error(error);
    throw error;
  }
}

export async function pushClientToIntegration({
  integrationType,
  integrationOwner,
  client,
  headers,
  queryParams = {},
}: {
  integrationType: IntegrationServiceId;
  integrationOwner: IntegrationOwner;
  client: ClientManager;
  headers?: { [key: string]: any };
  queryParams?: { [key: string]: any };
}) {
  try {
    const queryString = Object.keys(queryParams)
      .map((key) => key + '=' + queryParams[key])
      .join('&');

    const response = await API.put(
      'bitsybackendv2',
      `/clients/${
        client.id
      }/integrations/${integrationType}/values?integrationOwner=${integrationOwner}${
        queryString ? `&${queryString}` : ''
      }`,
      {
        body: client,
        ...(headers ? { headers } : {}),
      }
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the pushClientToIntegration function',
      },
    });
    console.error(error);
    throw error;
  }
}

export async function reinviteClient(clientId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/reinvite`, {
      type: 'client',
      id: clientId,
    });
    dispatch(slice.actions.reinviteClientSuccess());
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the reinviteClient function',
      },
    });
    dispatch(slice.actions.hasError(error));

    throw error;
  }
}

export async function shareNoteWithClient(clientId: string, noteId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put(
      'bitsybackendv2',
      `/v2/clients/${clientId}/meeting-notes/${noteId}/share`,
      {}
    );
    dispatch(slice.actions.shareNoteWithClientSuccess());
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the shareNoteWithClient function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function getClientNotePublic(clientId: string, noteId: string) {
  try {
    const response = await fetch(
      `${API_BASE}/v2/clients/${clientId}/public-meeting-notes/${noteId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the getClientNotePublicSuccess function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function saveClientNotePublic(clientId: string, noteId: string, noteData: any) {
  try {
    const response = await fetch(
      `${API_BASE}/v2/clients/${clientId}/public-meeting-notes/${noteId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the getClientNotePublicSuccess function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function findAllClientFromIntegrationByEmail({
  integrationType,
  integrationOwner,
  email,
  queryParams = {},
}: {
  integrationType: IntegrationServiceId;
  integrationOwner: IntegrationOwner;
  email: string;
  queryParams?: { [key: string]: any };
}) {
  try {
    const queryString = Object.keys(queryParams)
      .map((key) => key + '=' + queryParams[key])
      .join('&');

    const response = await API.get(
      'bitsybackendv2',
      `/integrations/${integrationType}/clients?email=${email}&integrationOwner=${integrationOwner}${
        queryString ? `&${queryString}` : ''
      }`,
      {}
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the findAllClientFromIntegrationByEmail function',
      },
    });
    console.error(error);
    throw error;
  }
}

export async function importClientFromIntegration({ data }: { data: any }) {
  try {
    const response = await API.post('bitsybackendv2', '/v2/automations', {
      body: data,
    });
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the importClientFromIntegration function',
      },
    });
    console.error(error);
    throw error;
  }
}
