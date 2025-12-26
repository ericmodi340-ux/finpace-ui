import { createSlice } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import { UserRole, UserState } from '../../@types/user';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: UserState = {
  isLoading: false,
  error: null,
  role: null,
  user: null,
};

const slice = createSlice({
  name: 'user',
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

    // GET USER
    getUserSuccess(state, action) {
      const { role, user } = action.payload;

      return {
        ...state,
        isLoading: false,
        role,
        user: { ...state.user, ...user },
      };
    },

    // UPDATE USER
    updateUserSuccess(state, action) {
      const { role, updateUser } = action.payload;
      if (role === state.role && updateUser.id === state.user?.id) {
        return {
          ...state,
          isLoading: false,
          user: { ...state.user, ...updateUser },
        };
      }
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getUserSuccess, updateUserSuccess } = slice.actions;

// ----------------------------------------------------------------------

export function getUser(role: UserRole, userId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const url = role === UserRole.CLIENT ? `/v2/${role}s/${userId}` : `/${role}s/${userId}`;
      const response = await API.get('bitsybackendv2', url, {});
      dispatch(slice.actions.getUserSuccess({ role, user: response }));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in USER slice in the getUser function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}
