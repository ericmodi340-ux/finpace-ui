import { createSlice } from '@reduxjs/toolkit';
import { Storage } from 'aws-amplify';
import * as Sentry from '@sentry/react';

// @types
import { DisclosuresState, DisclosureType } from '../../@types/disclosure';
// redux
import { dispatch } from 'redux/store';
// utils
import { getDisclosureType } from 'utils/disclosures';
import { types } from 'constants/disclosures';

// ----------------------------------------------------------------------

const initialState: DisclosuresState = {
  isLoading: false,
  error: null,
  [DisclosureType.FIRM]: [],
  [DisclosureType.ADVISOR]: [],
};

const slice = createSlice({
  name: 'disclosures',
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

    // GET DISCLOSURES
    getDisclosuresSuccess(state, action) {
      const { type, disclosures } = action.payload;

      return {
        ...state,
        isLoading: false,
        [type as DisclosureType]: disclosures,
      };
    },
  },
});

// Reducer
export default slice.reducer;

const getFirmPath = (firmId: string) => `firms/${firmId}/firmsDisclosures`;
const getAdvisorPath = (firmId: string) => `firms/${firmId}/advisorsDisclosures`;

// ----------------------------------------------------------------------

export async function getDisclosures(
  type: DisclosureType.FIRM | DisclosureType.ADVISOR,
  firmId: string,
  skipState?: boolean
) {
  dispatch(slice.actions.startLoading());
  try {
    let path = '';
    if (type === types.FIRM) {
      path = getFirmPath(firmId);
    } else if (type === types.ADVISOR) {
      path = getAdvisorPath(firmId);
    }

    const response = await Storage.list(path);
    if (skipState) {
      dispatch(slice.actions.stopLoading());
    } else {
      dispatch(slice.actions.getDisclosuresSuccess({ type, disclosures: response.results }));
    }
    return response.results;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in DISCLOSURES slice in the getDisclosures function',
      },
    });
    dispatch(slice.actions.hasError(error));
    throw error;
  }
}

export async function createDisclosures(
  type: DisclosureType.FIRM | DisclosureType.ADVISOR,
  firmId: string,
  userId: string,
  newDisclosures: Array<File>
) {
  dispatch(slice.actions.startLoading());
  try {
    //
    let path = '';
    if (type === types.FIRM) {
      path = getFirmPath(firmId);
    } else if (type === types.ADVISOR) {
      path = getAdvisorPath(firmId);
    }

    const response = await Promise.all(
      newDisclosures.map((file) =>
        Storage.put(`${path}/${userId}:::${file.name}`, file, {
          contentType: 'application/pdf',
        })
      )
    );

    await getDisclosures(type, firmId);
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in DISCLOSURES slice in the createDisclosures function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}

export async function deleteDisclosure(key: string, firmId: string) {
  dispatch(slice.actions.startLoading());
  try {
    const response = await Storage.remove(key);

    const type = getDisclosureType(key) as DisclosureType;

    if (type) {
      await getDisclosures(type, firmId);
    }

    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in DISCLOSURES slice in the deleteDisclosure function',
      },
    });
    dispatch(slice.actions.hasError(error));
  }
}
