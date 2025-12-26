import { createSlice } from '@reduxjs/toolkit';
import { API, Storage } from 'aws-amplify';

import * as Sentry from '@sentry/react';
// @types
import { ClientState, ClientManager, ClientNote } from '../../@types/client';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: ClientState = {
  isLoading: false,
  error: null,
  client: null,
  notes: [],
  meetingNotes: [],
};

const slice = createSlice({
  name: 'client',
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

    // GET CLIENT
    getClientSuccess(state, action) {
      state.isLoading = false;
      state.client = { ...state.client, ...action.payload };
    },

    // UPDATE CLIENT
    updateClientSuccess(state, action) {
      const updateClient = action.payload;
      state.isLoading = false;
      state.client = { ...state.client, ...updateClient };
    },

    // POST CLIENT CASE NOTE
    createNoteSuccess(state, action) {
      const newNote = action.payload;
      state.isLoading = false;
      state.notes = [...state.notes, newNote];
    },

    // GET CLIENT CASE NOTES
    getClientNotesSuccess(state, action) {
      state.isLoading = false;
      state.notes = [...state.notes, ...action.payload];
    },

    // UPDATE CLIENT CASE NOTE
    updateClientNoteSuccess(state, action) {
      state.isLoading = false;
      const newNote = action.payload;
      // Find index of modified note
      const index = state.notes.findIndex((note) => note.noteId === newNote.noteId);
      if (index !== -1) state.notes[index] = newNote;
    },

    // CLEAR CASE NOTES ON UNMOUNT COMPONENT
    clearNotes(state) {
      state.notes = [];
    },

    // GET CLIENT MEETING NOTES
    getClientMeetingNotesSuccess(state, action) {
      state.isLoading = false;
      state.meetingNotes = [...state.meetingNotes, ...action.payload];
    },

    // POST CLIENT MEETING NOTE
    createMeetingNoteSuccess(state, action) {
      const newNote = action.payload;
      state.isLoading = false;
      state.meetingNotes = [...state.meetingNotes, newNote];
    },

    // UPDATE CLIENT MEETING NOTE
    updateClientMeetingNoteSuccess(state, action) {
      state.isLoading = false;
      const newNote = action.payload;
      // Find index of modified note
      const index = state.meetingNotes.findIndex((note) => note.noteId === newNote.noteId);
      if (index !== -1) state.meetingNotes[index] = newNote;
    },

    // CLEAR MEETING NOTES ON UNMOUNT COMPONENT
    clearMeetingNotes(state) {
      state.meetingNotes = [];
    },
  },
});

export const { clearNotes, clearMeetingNotes } = slice.actions;

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getClient(clientId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/v2/clients/${clientId}`, {});
      dispatch(slice.actions.getClientSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in CLIENT slice in the getClient function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function updateClient(clientId: string, updateClient: Partial<ClientManager>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put('bitsybackendv2', `/clients/${clientId}`, {
      body: updateClient,
    });
    dispatch(slice.actions.updateClientSuccess(updateClient));
    return response;
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENT slice in the updateClient function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export function getClientNotes(clientId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/v2/clients/${clientId}/case-notes`, {});
      dispatch(slice.actions.getClientNotesSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in CLIENT slice in the getClientNotes function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function createClientNote(clientId: string, newNote: Partial<ClientNote>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/v2/clients/${clientId}/case-notes`, {
      body: newNote,
    });
    dispatch(slice.actions.createNoteSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the createClientNote function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateClientNote(
  clientId: string,
  noteId: string,
  newNote: Partial<ClientNote>
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put(
      'bitsybackendv2',
      `/v2/clients/${clientId}/case-notes/${noteId}`,
      {
        body: newNote,
      }
    );
    dispatch(slice.actions.updateClientNoteSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the updateClientNote function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function createAttachments(
  firmId: string,
  noteType: string,
  newAttachments: Array<File>
) {
  try {
    const response = await Promise.all(
      newAttachments.map((file) =>
        Storage.put(`firm/${firmId}/${noteType}/${Date.now()}/${file.name}`, file, {
          contentType: 'application/pdf',
        })
      )
    );
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in createAttachments slice in the createDisclosures function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}

export function getClientMeetingNotes(clientId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/v2/clients/${clientId}/meeting-notes`, {});
      dispatch(slice.actions.getClientMeetingNotesSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in CLIENT slice in the getClientMeetingNotes function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function createClientMeetingNote(clientId: string, newNote: Partial<ClientNote>) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/v2/clients/${clientId}/meeting-notes`, {
      body: newNote,
    });
    dispatch(slice.actions.createMeetingNoteSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the createClientMeetingNote function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateClientMeetingNote(
  clientId: string,
  noteId: string,
  newNote: Partial<ClientNote>
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put(
      'bitsybackendv2',
      `/v2/clients/${clientId}/meeting-notes/${noteId}`,
      {
        body: newNote,
      }
    );
    dispatch(slice.actions.updateClientMeetingNoteSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CLIENTS slice in the updateClientMeetingNote function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
