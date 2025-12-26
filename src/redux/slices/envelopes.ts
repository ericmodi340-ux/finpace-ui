import { map } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';

// @types
import { EnvelopeManager, EnvelopeState } from '../../@types/envelope';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: EnvelopeState = {
  isLoading: false,
  error: null,
  envelopes: [],
  loaded: false,
};

const slice = createSlice({
  name: 'envelopes',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // FINISH LOADING
    finishLoading(state) {
      state.isLoading = false;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET ENVELOPES
    getEnvelopesSuccess(state, action) {
      state.isLoading = false;
      state.envelopes = action.payload;
      state.loaded = true;
    },

    // CREATE ENVELOPE
    createEnvelopeSuccess(state, action) {
      const newEnvelope = action.payload;
      let envelopeAlreadyExisted = false;
      let newEnvelopes = map(state.envelopes, (_envelope) => {
        if (_envelope.id === newEnvelope.id) {
          envelopeAlreadyExisted = true;
          return newEnvelope;
        }
        return _envelope;
      });

      if (!envelopeAlreadyExisted) {
        newEnvelopes = [...newEnvelopes, newEnvelope];
      }

      return {
        ...state,
        isLoading: false,
        envelopes: newEnvelopes,
      };
    },

    // UPDATE ENVELOPE
    updateEnvelopeSuccess(state, action) {
      const updateEnvelope = action.payload;
      const updateEnvelopes = map(state.envelopes, (_envelope) => {
        if (_envelope.id === updateEnvelope.id) {
          return updateEnvelope;
        }
        return _envelope;
      });

      state.isLoading = false;
      state.envelopes = updateEnvelopes;
    },

    // UPDATE ENVELOPE STATUS
    updateEnvelopeStatus(state, action) {
      const { envelopeId, status } = action.payload;
      const updateEnvelopes = map(state.envelopes, (_envelope) => {
        if (_envelope.id === envelopeId) {
          return {
            ..._envelope,
            status,
          };
        }
        return _envelope;
      });

      state.isLoading = false;
      state.envelopes = updateEnvelopes;
    },

    // UPDATE ENVELOPE SIGNER STATUS
    updateEnvelopeSignerStatus(state, action) {
      const { envelopeId, roleName, status } = action.payload;
      const updateEnvelopes = map(state.envelopes, (_envelope) => {
        if (_envelope.id === envelopeId) {
          return {
            ..._envelope,
            recipients: {
              ..._envelope.recipients,
              [roleName]: {
                ..._envelope.recipients[roleName],
                status,
              },
            },
          };
        }
        return _envelope;
      });

      state.isLoading = false;
      state.envelopes = updateEnvelopes;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  createEnvelopeSuccess,
  updateEnvelopeSuccess,
  updateEnvelopeStatus,
  updateEnvelopeSignerStatus,
} = slice.actions;

// ----------------------------------------------------------------------

export function getEnvelopes() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/envelopes`, {});
      dispatch(slice.actions.getEnvelopesSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in ENVELOPES slice in the getEnvelopes function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function createEnvelope(newEnvelope: Partial<EnvelopeManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('create-envelope', '/', {
      body: newEnvelope,
    });
    dispatch(slice.actions.createEnvelopeSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ENVELOPES slice in the createEnvelope function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateEnvelope(envelopeId: string, updateEnvelope: Partial<EnvelopeManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put('bitsybackendv2', `/envelopes/${envelopeId}`, {
      body: updateEnvelope,
    });
    dispatch(slice.actions.updateEnvelopeSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ENVELOPES slice in the updateEnvelope function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function getSigningUrl(envelopeId: string, role: string) {
  try {
    const response = await API.get(
      'bitsybackendv2',
      `/envelopes/${envelopeId}/recipients/${role}/url`,
      {}
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ENVELOPES slice in the getSigningUrl function',
      },
    });
    console.error(error);
    throw error;
  }
}

export async function resendSigningEmail(envelopeId: string, role: string) {
  try {
    const response = await API.post(
      'bitsybackendv2',
      `/envelopes/${envelopeId}/recipients/${role}/resend`,
      {}
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ENVELOPES slice in the resendSigningEmail function',
      },
    });
    console.error(error);
    throw error;
  }
}

export async function finalizeEnvelope(
  envelopeId: string,
  updatedEnvelope: Partial<EnvelopeManager>
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/envelopes/${envelopeId}/finalize`, {
      body: updatedEnvelope,
    });
    dispatch(slice.actions.updateEnvelopeSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ENVELOPES slice in the finalizeEnvelope function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function getDocumentS3Url(envelopeId: string, documentId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get(
      'bitsybackendv2',
      `/envelopes/${envelopeId}/documents/${documentId}`,
      {
        body: {},
      }
    );
    dispatch(slice.actions.finishLoading());
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in ENVELOPES slice in the getDocumentS3Url function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
