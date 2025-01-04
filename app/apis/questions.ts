import type { IError } from '@/app/interfaces';
import type { ICustomQuestionDto, IQuestion } from '@/app/interfaces/question';

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

export const useFetchQuestions = (enabled?: boolean) => {
  const url = useResolvedUrl('/questions');
  const ticket = useStoredTicket();

  return useQuery<IQuestion[], IError>({
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
    queryKey: [useFetchQuestions.key, url, ticket],
  });
};

useFetchQuestions.key = 'fetchQuestions';

export const useCreateCustomQuestion = () => {
  const url = useResolvedUrl('/questions');
  const ticket = useStoredTicket();

  return useMutation<void, IError, ICustomQuestionDto>({
    mutationFn: async (options: ICustomQuestionDto) => {
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
    mutationKey: [useCreateCustomQuestion.key],
  });
};

useCreateCustomQuestion.key = 'createCustomQuestion';

export const useUpdateCustomQuestion = (questionId?: number) => {
  const url = useResolvedUrl(questionId ? `/questions/${questionId}` : null);
  const ticket = useStoredTicket();

  return useMutation<void, IError, ICustomQuestionDto>({
    mutationFn: async (options: ICustomQuestionDto) => {
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
    mutationKey: [useUpdateCustomQuestion.key],
  });
};

useUpdateCustomQuestion.key = 'updateCustomQuestion';
