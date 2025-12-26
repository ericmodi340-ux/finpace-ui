import { Storage } from 'aws-amplify';
import * as Sentry from '@sentry/react';
import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

export interface UrlCacheState {
  cache: {
    [path: string]: string;
  };
}

// https://bitsy-storage-dev.s3.us-east-1.amazonaws.com/public/firms/2a12159d-d50b-4f07-a651-ab501f1ce094/images/icon?response-cache-control=no-cache

export const storagePaths = {
  firmLogo: (firmId: string) => `firms/${firmId}/images/logo`,
  firmIcon: (firmId: string) => `firms/${firmId}/images/icon`,
  templatePdf: (firmId: string, templateId: string, fileName: string) =>
    `firms/${firmId}/templates/${templateId}/pdfs/${fileName}`,
  advisorLogo: (firmId: string, advisorId: string) =>
    `firms/${firmId}/advisors/${advisorId}/images/logo`,
  advisorIcon: (firmId: string, advisorId: string) =>
    `firms/${firmId}/advisors/${advisorId}/images/icon`,
  emailTemplateThumbnails: (advisorId: string, emailTemplateId: string) =>
    `advisors/${advisorId}/email-templates/${emailTemplateId}/thumbnails`,
  emailTemplateAttachments: (advisorId: string, emailTemplateId: string) =>
    `advisors/${advisorId}/email-templates/${emailTemplateId}/attachments`,
  emailTemplateTemplateImages: (advisorId: string, emailTemplateId: string) =>
    `advisors/${advisorId}/email-templates/${emailTemplateId}/images`,
  emailTemplateBulkEmailsCSV: (advisorId: string, emailTemplateId: string) =>
    `advisors/${advisorId}/email-templates/${emailTemplateId}/bulk-emails`,
  templateDocubuildImages: (templateId: string) => `templates/${templateId}/docubuild`,
};

const initialState: UrlCacheState = { cache: {} };

const slice = createSlice({
  name: 'urlCache',
  initialState: initialState,
  reducers: {
    setUrl: (state, action) => {
      const { path, url } = action.payload;
      state.cache[path] = url;
    },
  },
});

export const { setUrl } = slice.actions;
export default slice.reducer;

export async function getStorageItem({
  path,
  isPublic = true,
}: {
  path: string;
  isPublic?: boolean;
}) {
  try {
    const response = await Storage.get(path, {
      ...(!isPublic ? { level: 'private' } : {}),
      download: true,
      cacheControl: 'no-cache',
    });
    // @ts-ignore
    if (response?.Body) {
      // @ts-ignore
      const blob = await new Response(response?.Body).blob();
      // @ts-ignore
      const newBlob: Blob = new Blob([blob], { type: response?.ContentType });
      const result = URL.createObjectURL(newBlob);
      return result;
    } else {
      return '';
    }
  } catch (error: any) {
    if (error.toString() === 'NoSuchKey: The specified key does not exist.') {
      return '';
    }
    Sentry.captureException(error, {
      extra: {
        context: 'Error in STORAGE slice in the getStorageItem function: ',
      },
    });
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function createStorageItem({
  path,
  file,
  isPublic = true,
  contentType,
}: {
  path: string;
  file: File | Blob;
  isPublic?: boolean;
  contentType?: string;
}) {
  try {
    const response = await Storage.put(path, file, {
      ...(!isPublic ? { level: 'private' } : {}),
      contentType: contentType ? contentType : file.type,
    });
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in STORAGE slice in the createStorageItem function',
      },
    });
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function deleteStorageItem({
  path,
  isPublic = true,
}: {
  path: string;
  isPublic?: boolean;
}) {
  try {
    const response = await Storage.remove(path, {
      ...(!isPublic ? { level: 'private' } : {}),
    });
    return response;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Error in STORAGE slice in the deleteStorageItem function',
      },
    });
    throw error;
  }
}

const BlobCache = new Map<string, any>();

export async function getStorageBlob({
  path,
  isPublic = true,
}: {
  path: string;
  isPublic?: boolean;
}) {
  try {
    if (BlobCache.get(path)) return BlobCache.get(path);
    const response = await Storage.get(path, {
      ...(!isPublic ? { level: 'private' } : {}),
      download: true,
      cacheControl: '',
    });
    // @ts-ignore
    if (response?.Body) {
      // @ts-ignore
      const blob = await response?.Body?.blob();
      BlobCache.set(path, blob);
      return blob;
    } else {
      return '';
    }
  } catch (error: any) {
    if (error.toString() === 'NoSuchKey: The specified key does not exist.') {
      return '';
    }
    Sentry.captureException(error, {
      extra: {
        context: 'Error in STORAGE slice in the getStorageItem function: ',
      },
    });
    throw error;
  }
}
