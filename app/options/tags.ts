import { useMutation, useQuery } from '@tanstack/react-query';
import {
  useOptionKey,
  useOptionTicket,
  useOptionUrl,
} from '@/app/hooks/options';
import { AUTHENTICATION_HEADER, JSON_HEADER, POST } from '@/app/constants';
import { checkResponse, isValid } from '@/app/tool';
import type { IError } from '@/app/interfaces';
import type { ITag } from '@/app/interfaces/tag';
import type { IQuestion } from '@/app/interfaces/question';

interface ICustomTagDto {
  name?: string;
  names?: string[];
  tabId?: number;
}

/**
 * get tags
 */
export const useGetTagsOptions = () => {
  const url = useOptionUrl('/tags');
  const ticket = useOptionTicket();
  const { k, log } = useOptionKey({
    url,
    ticket,
    k: 'getTags',
  });

  return useQuery<ITag[], IError>({
    enabled: isValid(url) && isValid(ticket),
    queryKey: [url, ticket, k],
    queryFn: async () => {
      log();
      const response = await fetch(url, {
        headers: AUTHENTICATION_HEADER(ticket),
      });

      try {
        const result = (await checkResponse(response)) as ITag[];
        return [
          {
            id: -1,
            name: 'All',
            customizationSettings: {
              type: 'tag',
            },
          },
          ...result,
        ] as ITag[];
      } catch (e) {
        throw e;
      }
    },
  });
};

/**
 * get questions by id
 */
export const useGetQuestionsByIdOptions = (id?: number | undefined | null) => {
  const path = id === -1 ? '/questions' : `/tags/${id}/questions`;
  const url = useOptionUrl(path);
  const ticket = useOptionTicket();
  const { k, log } = useOptionKey({
    url,
    ticket,
    k: 'getQuestionsById',
    o: { id },
  });

  return useQuery<ITag, IError>({
    enabled: isValid(url) && isValid(ticket) && isValid(id),
    queryKey: [url, ticket, k, id],
    queryFn: async () => {
      log();
      const response = await fetch(url, {
        headers: AUTHENTICATION_HEADER(ticket),
      });

      try {
        const result = (await checkResponse(response)) as ITag | IQuestion[];
        if (Array.isArray(result)) {
          return {
            id: -1,
            name: 'All',
            questions: result,
            customizationSettings: {
              type: 'tag',
            },
          } as ITag;
        } else {
          return result;
        }
      } catch (e) {
        throw e;
      }
    },
  });
};

/**
 * custom tag
 */
export const useCustomTagOptions = () => {
  const url = useOptionUrl('/tags');
  const ticket = useOptionTicket();
  const { key: mutationKey, log } = useOptionKey({
    url,
    ticket,
    k: 'CustomTag',
  });

  return useMutation<void, IError, ICustomTagDto>({
    mutationKey,
    mutationFn: async (options: ICustomTagDto) => {
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
