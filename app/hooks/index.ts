import { TK } from '@/app/constants';
import { AuthContext } from '@/app/contexts/auth';
import { ThemeContext } from '@/app/contexts/theme';
import { useContext, useEffect, useState } from 'react';

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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useStoredTicket must be used within an AuthProvider');
  }

  return context.token;
};

export const useSetToken = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSetToken must be used within an AuthProvider');
  }

  return (token: string) => {
    context.setToken(token);
    localStorage.setItem(TK, token);
  };
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
