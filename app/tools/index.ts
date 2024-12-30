import { AUTHORIZATION, BEARER } from '@/app/constants';
import sanitizeHtml from 'sanitize-html';

export const handleApiResponse = async (response: Response, whitelistPath?: string[]) => {
  if (!response.ok) {
    const error = await response.json();
    if (
      error.statusCode === 401 &&
      (!Array.isArray(whitelistPath) || (Array.isArray(whitelistPath) && whitelistPath.length === 0))
    ) {
      if (typeof location !== undefined) {
        location.assign(getPublicPath() + '/login');
      }
    }

    return Promise.reject(error);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.startsWith('application/json')) {
    return response.json();
  }

  return response;
};

export const isDefinedAndNotEmpty = (...values: (null | number | string | undefined)[]) => {
  return values.every((value) => value !== undefined && value !== null && value !== '');
};

export const buildAuthHeader = (tk: null | string | undefined): Record<string, string> => {
  return tk ? { [AUTHORIZATION]: `${BEARER} ${tk}` } : {};
};

export const buildJsonHeader = (): Record<string, string> => {
  return { 'Content-Type': 'application/json' };
};

export const buildHeaders = (
  ticket: null | string | undefined,
  additionalHeaders: Record<string, string> = {},
): Record<string, string> => {
  return {
    ...buildJsonHeader(),
    ...buildAuthHeader(ticket),
    ...additionalHeaders,
  };
};

export const createUrlResolutionError = (message: string = 'The requested resource URL could not be resolved') => {
  const error = new Error(message);
  error.name = 'UrlResolutionError';
  return error;
};

export const sanitizeInput = (value: string) => {
  return sanitizeHtml(value, {
    allowedAttributes: false,
    nonBooleanAttributes: [],
  });
};

export const getPublicPath = () => {
  return process.env.NEXT_PUBLIC_PUBLIC_PATH || '';
};
