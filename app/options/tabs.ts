import { useMutation, useQuery } from '@tanstack/react-query';
import {
  useOptionKey,
  useOptionTicket,
  useOptionUrl,
} from '@/app/hooks/options';
import { AUTHENTICATION_HEADER, JSON_HEADER, POST } from '@/app/constants';
import { checkResponse, isValid } from '@/app/tool';
import type { ITab } from '@/app/interfaces/tab';
import type { IError } from '@/app/interfaces';

interface ICustomTabDto {
  name?: string;
  names?: string[];
}

/**
 * get tabs
 */
export const useGetTabsOptions = () => {
  const url = useOptionUrl('/tabs');
  const ticket = useOptionTicket();
  const { k, log } = useOptionKey({
    url,
    ticket,
    k: 'getTabs',
  });

  return useQuery<ITab[], IError>({
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

/**
 * get tags by id
 */
export const useGetTagsByIdOptions = (id?: number | undefined | null) => {
  const url = useOptionUrl(`/tabs/${id}/tags`);
  const ticket = useOptionTicket();
  const { k, log } = useOptionKey({
    url,
    ticket,
    k: 'getTagsById',
    o: { id },
  });

  return useQuery<ITab, IError>({
    enabled: isValid(url) && isValid(ticket) && isValid(id),
    queryKey: [url, ticket, k, id],
    queryFn: async () => {
      log();
      const response = await fetch(url, {
        headers: AUTHENTICATION_HEADER(ticket),
      });

      return checkResponse(response);
    },
  });
};

/**
 * custom tab
 */
export const useCustomTabOptions = () => {
  const url = useOptionUrl('/tabs');
  const ticket = useOptionTicket();
  const { key: mutationKey, log } = useOptionKey({
    url,
    ticket,
    k: 'CustomTab',
  });

  return useMutation<void, IError, ICustomTabDto>({
    mutationKey,
    mutationFn: async (options: ICustomTabDto) => {
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
