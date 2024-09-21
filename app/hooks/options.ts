import { TK } from '@/app/constants';
import { useEffect, useId, useState } from 'react';

type Options = {
  url?: string;
  ticket?: string | null | undefined;
  k?: string;
  o?: string | null | undefined | Record<string, any>;
};

export const useOptionUrl = (path: string = '') => {
  const baseUrl = process.env.NEXT_PUBLIC_API_SERVER;
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!path.includes('/undefined/') && !path.includes('/null/')) {
      if (/^https?:\/\//.test(path)) {
        setUrl(path);
      } else {
        setUrl(
          path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`,
        );
      }
    }
  }, [path]);

  return url;
};

export const useOptionTicket = () => {
  const [token, setToken] = useState<undefined | null | string>();

  useEffect(() => {
    if (typeof localStorage !== undefined) {
      setToken(localStorage.getItem(TK));
    }
  }, []);

  return token;
};

export const useOptionKey = ({ url, ticket, k, o }: Options) => {
  const id = useId();
  const sanitize = (value: any, fallback: string = '-') => value ?? fallback;

  return {
    k,
    key: [
      {
        url,
        ticket: sanitize(ticket, '-'),
      },
      {
        k,
        o: sanitize(o, '-'),
      },
    ],
    log: (options?: Options) => {
      const {
        url: logUrl,
        ticket: logTicket,
        k: logK,
        o: logO,
      } = {
        url,
        ticket,
        k,
        o,
        ...options,
      };
      const date = new Date().toISOString();
      console.log(
        `${id} ${date} INFO --- [prepforge] --- : ${sanitize(logUrl)} ${sanitize(logTicket)} ${sanitize(logK)} ${logO ? JSON.stringify(logO) : '-'}`,
      );
    },
  };
};
