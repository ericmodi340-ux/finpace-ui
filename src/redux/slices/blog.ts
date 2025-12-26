import { createSlice } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import { API } from 'aws-amplify';
// utils
import axios from '../../utils/axios';
// @types
import { BlogState } from '../../@types/blog';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState: BlogState = {
  isLoading: false,
  error: null,
  posts: [],
  post: null,
  recentPosts: [],
  hasMore: true,
  index: 0,
  step: 11,
  email: null,
};

const slice = createSlice({
  name: 'blog',
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

    // GET POSTS
    getPostsSuccess(state, action) {
      state.isLoading = false;
      state.posts = action.payload;
    },

    // GET POST INFINITE
    getPostsInitial(state, action) {
      state.isLoading = false;
      state.posts = action.payload;
    },

    getMorePosts(state) {
      const setIndex = state.index + state.step;
      state.index = setIndex;
    },

    noHasMore(state) {
      state.hasMore = false;
    },

    // GET POST
    getPostSuccess(state, action) {
      state.isLoading = false;
      state.post = action.payload;
    },

    // GET RECENT POST
    getRecentPostsSuccess(state, action) {
      state.isLoading = false;
      state.recentPosts = action.payload;
    },

    // SAVING LAST BlOG POST
    saveBlogPost(state, action) {
      state.isLoading = false;
      state.post = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getMorePosts } = slice.actions;

// ----------------------------------------------------------------------

export function getAllPosts() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/blog/posts/all');
      dispatch(slice.actions.getPostsSuccess(response.data.posts));
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in BLOG slice in the getAllPosts function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPostsInitial(index: number, step: number) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/blog/posts', {
        params: { index, step },
      });
      const results = response.data.results.length;
      const { maxLength } = response.data;

      dispatch(slice.actions.getPostsInitial(response.data.results));

      if (results >= maxLength) {
        dispatch(slice.actions.noHasMore());
      }
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'Error in BLOG slice in the getPostsInitial function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPost(title: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/blog/post', {
        params: { title },
      });
      dispatch(slice.actions.getPostSuccess(response.data.post));
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, {
        extra: {
          context: 'Error in BLOG slice in the getPost function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getRecentPosts(title: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/blog/posts/recent', {
        params: { title },
      });

      dispatch(slice.actions.getRecentPostsSuccess(response.data.recentPosts));
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, {
        extra: {
          context: 'Error in BLOG slice in the getRecentPosts function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function saveBlogPost(advisorId: string, data: any) {
  return async () => {
    try {
      const response = await API.post('bitsybackendv2', `/v2/advisors/${advisorId}/blog-posts`, {
        body: data,
      });

      dispatch(slice.actions.saveBlogPost(response));
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, {
        extra: {
          context: 'Error in BLOG slice in the saveBlogPost function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function updateBlogPost(advisorId: string, data: any, blogId: string) {
  return async () => {
    try {
      const response = await API.put(
        'bitsybackendv2',
        `/v2/advisors/${advisorId}/blog-posts/${blogId}`,
        {
          body: data,
        }
      );

      dispatch(slice.actions.saveBlogPost(response));
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, {
        extra: {
          context: 'Error in BLOG slice in the updateBlogPost function',
        },
      });
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function sendBulkEmail(blogId: string) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await API.post('bitsybackendv2', `/v2/clients/blog-post`, {
        body: { blogId },
      });
      return response;
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, {
        extra: {
          context: 'Error in BLOG slice in the sendBulkEmail function',
        },
      });
      dispatch(slice.actions.hasError(error));
    } finally {
      dispatch(slice.actions.finishLoading());
    }
  };
}
