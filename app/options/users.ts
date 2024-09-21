import { useMutation, useQuery } from '@tanstack/react-query';
import {
  useOptionKey,
  useOptionTicket,
  useOptionUrl,
} from '@/app/hooks/options';
import { AUTHENTICATION_HEADER, JSON_HEADER, POST } from '@/app/constants';
import { checkResponse, isValid } from '@/app/tool';
import type { IError, IToken } from '@/app/interfaces';
import type { IUser } from '@/app/interfaces/user';

interface ILoginDto {
  username: string;
  password: string;
}

/**
 * login
 */
export const useLoginOptions = () => {
  const url = useOptionUrl('/users/login');
  const ticket = useOptionTicket();
  const { key: mutationKey, log } = useOptionKey({
    url,
    ticket,
    k: 'login',
  });

  return useMutation<IToken, IError, ILoginDto>({
    mutationKey,
    mutationFn: async (options: ILoginDto) => {
      log({
        o: options,
      });
      const response = await fetch(url, {
        method: POST,
        body: JSON.stringify(options),
        headers: {
          ...JSON_HEADER,
          ...AUTHENTICATION_HEADER(ticket),
        },
      });

      return checkResponse(response);
    },
  });
};

/**
 * get profile
 */
export const useGetProfileOptions = () => {
  const url = useOptionUrl('/users/profile');
  const ticket = useOptionTicket();
  const { k, log } = useOptionKey({
    url,
    ticket,
    k: 'getProfile',
  });

  return useQuery<IUser, IError>({
    enabled: isValid(url) && isValid(ticket),
    queryKey: [url, ticket, k],
    queryFn: async () => {
      log();
      const response = await fetch(url, {
        headers: AUTHENTICATION_HEADER(ticket),
      });

      return checkResponse(response);
    },
  });
};
