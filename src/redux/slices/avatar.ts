import { createSlice } from '@reduxjs/toolkit';
import { dispatch } from 'redux/store';

const initialState = {
  avatarUrl: '',
};

const slice = createSlice({
  name: 'avatar',
  initialState,
  reducers: {
    setUrl(state, action) {
      state.avatarUrl = action.payload;
    },
  },
});

export default slice.reducer;

export const setAvatarUrl = (url: string) => {
  dispatch(slice.actions.setUrl(url));
};
