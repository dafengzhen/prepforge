import type { IError, IToken } from '@/app/interfaces';
import type { ILoginDto, IUser } from '@/app/interfaces/user';

import { POST } from '@/app/constants';
import { useResolvedUrl, useStoredTicket } from '@/app/hooks';
import {
  buildAuthHeader,
  buildHeaders,
  createUrlResolutionError,
  handleApiResponse,
  isDefinedAndNotEmpty,
} from '@/app/tools';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useLogin = () => {
  const url = useResolvedUrl('/users/login');
  const ticket = useStoredTicket();

  return useMutation<IToken, IError, ILoginDto>({
    mutationFn: async (options: ILoginDto) => {
      if (!url) {
        throw createUrlResolutionError();
      }

      const response = await fetch(url, {
        body: JSON.stringify(options),
        headers: buildHeaders(ticket),
        method: POST,
      });

      return handleApiResponse(response);
    },
    mutationKey: ['login'],
  });
};

export const useFetchUserProfile = () => {
  const url = useResolvedUrl('/users/profile');
  const ticket = useStoredTicket();

  return useQuery<IUser, IError>({
    enabled: isDefinedAndNotEmpty(url, ticket),
    queryFn: async () => {
      if (!url) {
        throw createUrlResolutionError();
      }

      const response = await fetch(url, {
        headers: buildAuthHeader(ticket),
      });

      return handleApiResponse(response);
    },
    queryKey: ['fetchUserProfile', url, ticket],
  });
};
