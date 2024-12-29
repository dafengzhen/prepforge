import type { IError } from '@/app/interfaces';
import type { IQuestion } from '@/app/interfaces/question';
import type { ICustomTagDto, ITag } from '@/app/interfaces/tag';

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

export const useFetchTags = (enabled?: boolean) => {
  const url = useResolvedUrl('/tags');
  const ticket = useStoredTicket();

  return useQuery<ITag[], IError>({
    enabled: isDefinedAndNotEmpty(url, ticket) && enabled,
    queryFn: async () => {
      if (!url) {
        throw createUrlResolutionError();
      }

      const response = await fetch(url, {
        headers: buildAuthHeader(ticket),
      });

      return handleApiResponse(response);
    },
    queryKey: ['fetchTags', url, ticket],
  });
};

export const useFetchQuestionsByTagId = (tagId?: number) => {
  const url = useResolvedUrl(tagId ? `/tags/${tagId}/questions` : null);
  const ticket = useStoredTicket();

  return useQuery<IQuestion[], IError>({
    enabled: isDefinedAndNotEmpty(url, ticket, tagId),
    queryFn: async () => {
      if (!url) {
        throw createUrlResolutionError();
      }

      const response = await fetch(url, {
        headers: buildAuthHeader(ticket),
      });

      const tag = (await handleApiResponse(response)) as ITag;
      return tag.questions || [];
    },
    queryKey: ['fetchQuestionsByTagId', url, ticket, tagId],
  });
};

export const useCreateCustomTag = () => {
  const url = useResolvedUrl('/tags');
  const ticket = useStoredTicket();

  return useMutation<void, IError, ICustomTagDto>({
    mutationFn: async (options: ICustomTagDto) => {
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
    mutationKey: ['createCustomTag'],
  });
};
