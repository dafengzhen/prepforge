export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';
export const PATCH = 'PATCH';
export const DELETE = 'DELETE';

export const KEY_PREFIX = '_prepforge_';

export const TK = '_prepforge_tk';

export const AUTHORIZATION = 'Authorization';

export const BEARER = 'Bearer';

export const JSON_HEADER = {
  'Content-Type': 'application/json',
};

export const AUTHENTICATION_HEADER = (tk: string | undefined | null) => {
  return tk
    ? {
        [AUTHORIZATION]: `${BEARER} ${tk}`,
      }
    : ({} as Record<string, string>);
};
