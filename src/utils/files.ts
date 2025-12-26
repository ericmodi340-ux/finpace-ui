import { sentenceCase } from 'change-case';
import { FileError } from 'react-dropzone';
import {
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
  AVATAR_MIN_SIZE,
  FILE_MAX_SIZE,
  FILE_MIN_SIZE,
  MAX_FILE_NAME_LENGTH,
} from '../config';

export const downloadTextFile = (text: string, name: string) => {
  const a = document.createElement('a');
  const type = name.split('.').pop();
  a.href = URL.createObjectURL(
    new Blob([text], { type: `text/${type === 'txt' ? 'plain' : type}` })
  );
  a.download = name;
  a.click();
};

export const hasExtension = (file: any, exts: Array<string>) => {
  if (!file?.path) return false;

  const fileExt = file.path.substring(file.path.lastIndexOf('.')).toLowerCase();
  const normalizedExts = exts.map((ext) =>
    ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : '.' + ext.toLowerCase()
  );

  return normalizedExts.includes(fileExt);
};

export const hasValidFileSize = (file: any, upperLimit: number, lowerLimit: number) =>
  file.size <= upperLimit && file.size >= lowerLimit;

export const hasValidFileNameLength = (file: any, limit: number) => file.name.length <= limit;

/**
 * Load the mime type based on the signature of the first bytes of the file
 * @param  {File}  file        A instance of File
 */
export const validateMime = (file: File, callback: any) => {
  //List of known mimes
  const mimes = [
    {
      mime: 'image/jpeg',
      pattern: [0xff, 0xd8, 0xff],
      mask: [0xff, 0xff, 0xff],
    },
    {
      mime: 'image/png',
      pattern: [0x89, 0x50, 0x4e, 0x47],
      mask: [0xff, 0xff, 0xff, 0xff],
    },
    {
      mime: 'image/gif',
      pattern: [0x47, 0x49, 0x46, 0x38],
      mask: [0xff, 0xff, 0xff, 0xff],
    },
    {
      mime: 'application/pdf',
      pattern: [0x25, 0x50, 0x44, 0x46],
      mask: [0xff, 0xff, 0xff, 0xff],
    },
    {
      mime: 'application/msword',
      pattern: [208, 207, 17, 224],
      mask: [0xff, 0xff, 0xff, 0xff],
    },
    {
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pattern: [80, 75, 3, 4],
      mask: [0xff, 0xff, 0xff, 0xff],
    },
    // you can expand this list @see https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
  ];

  function check(bytes: any, mime: any) {
    for (let i = 0, l = mime.mask.length; i < l; ++i) {
      // Checking if file byte matches mime type byte
      if ((bytes[i] & mime.mask[i]) - mime.pattern[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  const getMimeBytes = (file: File) => {
    const mimeBytes = mimes.filter((mime) => file.type === mime.mime);
    return mimeBytes[0];
  };

  const blob = file.slice(0, 4); //read the first 4 bytes of the file

  const reader = new FileReader();
  let hasValidMime = false;
  reader.onloadend = function (e) {
    if (e.target && e.target.readyState === FileReader.DONE) {
      //@ts-ignore
      const bytes = new Uint8Array(e.target.result);
      const mimeTYPE = getMimeBytes(file);
      if (check(bytes, mimeTYPE)) {
        hasValidMime = true;
        return callback(true);
      }
      return callback(false);
    }
  };
  reader.readAsArrayBuffer(blob);
  return hasValidMime;
};

export const isValidFile = (
  file: File,
  enqueueSnackbar: any,
  isAvatar: boolean = true
): FileError | FileError[] | null => {
  const entity = isAvatar ? 'avatar' : 'document';
  const validExtensions = isAvatar ? ALLOWED_IMAGE_EXTENSIONS : ALLOWED_FILE_EXTENSIONS;
  let error = null;

  if (!file.name) return error;

  if (!hasExtension(file, validExtensions)) {
    enqueueSnackbar(`${sentenceCase(entity)} has invalid file extensions`, {
      variant: 'error',
    });
    error = {
      code: 'invalid-file-extension',
      message: `".${String(file?.name || '')
        ?.split('.')
        ?.pop()}" are not allowed in the file name. File extension is invalid`,
    };
  }
  if (!hasValidFileSize(file, FILE_MAX_SIZE, isAvatar ? AVATAR_MIN_SIZE : FILE_MIN_SIZE)) {
    enqueueSnackbar(`${sentenceCase(entity)} is too small or too large`, {
      variant: 'error',
    });
    error = {
      code: 'invalid-file-size',
      message: 'The file size is invalid',
    };
  }
  if (!hasValidFileNameLength(file, MAX_FILE_NAME_LENGTH)) {
    enqueueSnackbar(`${sentenceCase(entity)}'s file name is too large`, {
      variant: 'error',
    });
    error = {
      code: 'invalid-file-name-length',
      message: 'The file name is too long',
    };
  }

  return error;
};

export async function blobToBase64(blob: Blob) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
