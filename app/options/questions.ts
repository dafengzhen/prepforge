import { useMutation, useQuery } from '@tanstack/react-query';
import {
  useOptionKey,
  useOptionTicket,
  useOptionUrl,
} from '@/app/hooks/options';
import { AUTHENTICATION_HEADER, JSON_HEADER, POST } from '@/app/constants';
import { checkResponse, isValid } from '@/app/tool';
import type { IError } from '@/app/interfaces';
import type { IQuestion } from '@/app/interfaces/question';

interface ICustomQuestionDto {
  question?: string;
  answer?: string;
  questions?: Pick<ICustomQuestionDto, 'question' | 'answer'>[];
  tabId?: number;
  tagId?: number;
}

/**
 * get questions
 */
export const useGetQuestionsOptions = () => {
  const url = useOptionUrl('/questions');
  const ticket = useOptionTicket();
  const { k, log } = useOptionKey({
    url,
    ticket,
    k: 'getQuestions',
  });

  return useQuery<IQuestion[], IError>({
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
 * custom question
 */
export const useCustomQuestionOptions = () => {
  const url = useOptionUrl('/questions');
  const ticket = useOptionTicket();
  const { key: mutationKey, log } = useOptionKey({
    url,
    ticket,
    k: 'CustomQuestion',
  });

  return useMutation<void, IError, ICustomQuestionDto>({
    mutationKey,
    mutationFn: async (options: ICustomQuestionDto) => {
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
