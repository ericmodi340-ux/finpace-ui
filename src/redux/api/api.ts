import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { API } from 'aws-amplify';

const amplifyBaseQuery: BaseQueryFn<
  { url: string; method: string; data?: any; params?: any },
  unknown,
  unknown
> = async ({ url, method, data, params }) => {
  try {
    const result = await (API as any)[method.toLowerCase()]('bitsybackendv2', url, {
      body: data,
      queryStringParameters: params,
    });
    return { data: result };
  } catch (error) {
    return { error };
  }
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: amplifyBaseQuery,
  tagTypes: ['Board'],
  endpoints: () => ({}),
});
