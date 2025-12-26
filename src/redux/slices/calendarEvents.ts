import { map, filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import { CalendarState, ICalendarEvent } from '../../@types/calendar';
// actions
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: CalendarState = {
  isLoading: false,
  error: null,
  calendarEvents: [],
};

const slice = createSlice({
  name: 'calendarEvents',
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

    // GET CALENDARS
    getCalendarEventsSuccess(state, action) {
      const calendarEvents = action.payload;

      return {
        ...state,
        isLoading: false,
        calendarEvents,
      };
    },

    // CREATE CALENDAR
    createCalendarEventSuccess(state, action) {
      const newCalendarEvent = action.payload;

      return {
        ...state,
        isLoading: false,
        calendarEvents: [...state.calendarEvents, newCalendarEvent],
      };
    },

    // UPDATE CALENDAR
    updateCalendarEventSuccess(state, action) {
      const updateCalendar = action.payload;
      const updateCalendars = map(state.calendarEvents, (_calendar) => {
        if (_calendar.id === updateCalendar.id) {
          return updateCalendar;
        }
        return _calendar;
      });

      state.isLoading = false;
      state.calendarEvents = updateCalendars;
    },

    // UPDATE CALENDAR
    updateCalendarEvent(state, action) {
      const updateCalendar = action.payload;
      const updateCalendars = map(state.calendarEvents, (_calendar) => {
        if (_calendar.id === updateCalendar.id) {
          return updateCalendar;
        }
        return _calendar;
      });
      return {
        ...state,
        isLoading: false,
        calendarEvents: updateCalendars,
      };
    },

    // DELETE CALENDAR
    deleteCalendarEventSuccess(state, action) {
      const { id } = action.payload;
      const deleteCalendars = filter(state.calendarEvents, (calendar) => calendar.id !== id);

      return {
        ...state,
        isLoading: false,
        calendarEvents: deleteCalendars,
      };
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export async function getCalendarEvents(advisorId: string, additionalAdvisors?: string[]) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get(
      'bitsybackendv2',
      `/v2/advisors/${advisorId}/calendar-events${
        additionalAdvisors?.length ? `?additionalAdvisors=${additionalAdvisors.join(',')}` : ''
      }`,
      {}
    );
    dispatch(slice.actions.getCalendarEventsSuccess(response));
  } catch (error) {
    console.log('Getting calendar error...', error);
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CALENDARS slice in the getCalendarEvents function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}

export async function createCalendarEvent(advisorId: string, newCalendarEvent: ICalendarEvent) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.post('bitsybackendv2', `/v2/advisors/${advisorId}/calendar-events`, {
      body: newCalendarEvent,
    });
    dispatch(slice.actions.createCalendarEventSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CALENDARS slice in the createCalendarEvent function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function updateCalendarEvent(
  advisorId: string,
  calendarId: string,
  updatedCalendarEvent: Partial<ICalendarEvent>
) {
  dispatch(slice.actions.updateCalendarEvent(updatedCalendarEvent));
  try {
    const response = await API.put(
      'bitsybackendv2',
      `/v2/advisors/${advisorId}/calendar-events/${calendarId}`,
      {
        body: updatedCalendarEvent,
      }
    );
    dispatch(slice.actions.updateCalendarEvent(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CALENDARS slice in the updateCalendarEvent function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function deleteCalendarEvent(
  advisorId: string,
  calendarId: string,
  updatedCalendarEvent: ICalendarEvent
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put(
      'bitsybackendv2',
      `/v2/advisors/${advisorId}/calendar-events/${calendarId}`,
      {
        body: updatedCalendarEvent,
      }
    );
    dispatch(slice.actions.deleteCalendarEventSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in CALENDARS slice in the deleteCalendarEvent function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
