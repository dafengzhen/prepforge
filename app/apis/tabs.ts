import type { IError } from '@/app/interfaces';
import type { ICustomTabDto, ITab } from '@/app/interfaces/tab';
import type { ITag } from '@/app/interfaces/tag';

import { POST, PUT } from '@/app/constants';
import { useResolvedUrl, useStoredTicket } from '@/app/hooks';
import {
  buildAuthHeader,
  buildHeaders,
  createUrlResolutionError,
  handleApiResponse,
  isDefinedAndNotEmpty,
} from '@/app/tools';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useFetchTabs = () => {
  const url = useResolvedUrl('/tabs');
  const ticket = useStoredTicket();

  return useQuery<ITab[], IError>({
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
    queryKey: ['fetchTabs', url, ticket],
  });
};

export const useFetchTagsByTabId = (tabId?: number) => {
  const url = useResolvedUrl(tabId ? `/tabs/${tabId}/tags` : null);
  const ticket = useStoredTicket();

  return useQuery<ITag[], IError>({
    enabled: isDefinedAndNotEmpty(url, ticket, tabId),
    queryFn: async () => {
      if (!url) {
        throw createUrlResolutionError();
      }

      const response = await fetch(url, {
        headers: buildAuthHeader(ticket),
      });

      const tab = (await handleApiResponse(response)) as ITab;
      return tab.tags || [];
    },
    queryKey: ['fetchTagsByTabId', url, ticket, tabId],
  });
};

export const useCreateCustomTab = () => {
  const url = useResolvedUrl('/tabs');
  const ticket = useStoredTicket();

  return useMutation<void, IError, ICustomTabDto>({
    mutationFn: async (options: ICustomTabDto) => {
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
    mutationKey: ['createCustomTab'],
  });
};

export const useUpdateCustomTab = (tabId?: number) => {
  const url = useResolvedUrl(tabId ? `/tabs/${tabId}` : null);
  const ticket = useStoredTicket();

  return useMutation<void, IError, ICustomTabDto>({
    mutationFn: async (options: ICustomTabDto) => {
      if (!url) {
        throw createUrlResolutionError();
      }

      const response = await fetch(url, {
        body: JSON.stringify(options),
        headers: buildHeaders(ticket),
        method: PUT,
      });

      return handleApiResponse(response);
    },
    mutationKey: ['updateCustomTab'],
  });
};
