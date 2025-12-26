import { createSlice } from '@reduxjs/toolkit';
import { API, Auth } from 'aws-amplify';
import * as Sentry from '@sentry/react';
// @types
import { PubSubState } from '../../@types/pubsub';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: PubSubState = {
  isLoading: false,
  error: null,
  subId: '',
};

const slice = createSlice({
  name: 'pubsub',
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

    // REGISTER USER
    registerUserSuccess(state, action) {
      state.isLoading = false;
      state.subId = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

const updateCognitoPool = async (identityId: string) => {
  const user = await Auth.currentAuthenticatedUser();

  return Auth.updateUserAttributes(user, {
    'custom:cognitoIdentityId': identityId,
  });
};

// ----------------------------------------------------------------------

export function registerUser() {
  console.log('Getting the user identity ID...');
  return async () => {
    try {
      const info = await Auth.currentCredentials();

      await Promise.allSettled([
        updateCognitoPool(info.identityId),
        API.post('bitsybackendv2', '/register', {
          body: {
            cognitoIdentityId: info.identityId,
          },
        })
          .then(() => {
            dispatch(slice.actions.registerUserSuccess(info.identityId));
          })
          .catch((error) => {
            dispatch(slice.actions.hasError(error));
          }),
      ]);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in PUBSUB slice in the registerUser function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}
