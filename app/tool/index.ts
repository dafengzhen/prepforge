/**
 * checkResponse.
 *
 * @param response
 */
export const checkResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    if (error.statusCode === 401) {
      if (typeof location !== undefined) {
        location.assign('/login');
      }
    }

    return error;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.startsWith('application/json')) {
    return response.json();
  }

  return response;
};

/**
 * isValid.
 *
 * @param value value
 */
export const isValid = (value: undefined | null | string | number) => {
  return value !== undefined && value !== null && value !== '';
};

/**
 * isNumeric.
 *
 * @param value value
 */
export const isNumeric = (value: any) => {
  return typeof value === 'number' && isFinite(value);
};
