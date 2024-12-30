import { TK } from '@/app/constants';
import { useEffect, useState } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_API_SERVER || '';

export const useResolvedUrl = (path: null | string | undefined) => {
  const [url, setUrl] = useState<null | string | undefined>(null);

  useEffect(() => {
    if (path) {
      setUrl(/^https?:\/\//.test(path) ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`);
    }
  }, [path]);

  return url;
};

export const useStoredTicket = () => {
  const [token, setToken] = useState<null | string | undefined>(null);

  useEffect(() => {
    const value = localStorage.getItem(TK);
    if (value) {
      if (value === 'null' || value === 'undefined' || value === 'true' || value === 'false') {
        localStorage.removeItem(TK);
      } else {
        setToken(localStorage.getItem(TK));
      }
    }
  }, []);

  return token;
};
