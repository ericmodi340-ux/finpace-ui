import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import objFromArray from 'utils/objFromArray';
import * as Sentry from '@sentry/react';
// @types
import { NotificationManager, NotificationsState } from '../../@types/notification';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: NotificationsState = {
  isLoading: false,
  error: null,
  byId: {},
  allIds: [],
};

const slice = createSlice({
  name: 'notifications',
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

    // GET NOTIFICATIONS
    getNotificationsSuccess(state, action) {
      const notifications = action.payload;

      const notificationsObj = objFromArray(notifications);

      return {
        ...state,
        isLoading: false,
        byId: notificationsObj,
        allIds: Object.keys(notificationsObj),
      };
    },

    // CREATE FORM
    createNotificationSuccess(state, action) {
      const newNotification = action.payload;
      const { id } = newNotification;
      return {
        ...state,
        isLoading: false,
        byId: {
          ...state.byId,
          [id]: newNotification,
        },
        //If not exist Notification in state then add its id
        allIds: state.allIds.includes(id) ? [...state.allIds] : [...state.allIds, id],
      };
    },

    // UPDATE NOTIFICATION
    updateNotificationSuccess(state, action) {
      state.isLoading = false;
      action.payload.forEach((notification: any) => {
        state.byId[notification.id] = notification;
      });
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { createNotificationSuccess, updateNotificationSuccess } = slice.actions;

// ----------------------------------------------------------------------

export function getNotifications() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.get('bitsybackendv2', `/notifications`, {});
      dispatch(slice.actions.getNotificationsSuccess(response));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in NOTIFICATIONS slice in the getNotifications function',
        },
      });
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function updateNotification(
  notificationIds: Array<string>,
  updateNotification: Partial<NotificationManager>
) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.put('bitsybackendv2', '/notifications', {
      body: {
        ...updateNotification,
        notificationIds,
      },
    });
    console.log(response);
    dispatch(slice.actions.updateNotificationSuccess(response));
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in NOTIFICATIONS slice in the updateNotification function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}
