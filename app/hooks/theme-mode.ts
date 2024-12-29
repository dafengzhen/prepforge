import { KEY_PREFIX } from '@/app/constants';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = `${KEY_PREFIX}darkMode`;

const updateThemeAttribute = (isDark: boolean) => {
  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
};

function useThemeMode(): [boolean, () => void] {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY);
      const isDark = savedMode ? JSON.parse(savedMode) : false;
      setIsDarkMode(isDark);
      updateThemeAttribute(isDark);
    } catch {
      console.error('Failed to retrieve dark mode state');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMode));
      updateThemeAttribute(newMode);
      return newMode;
    });
  }, []);

  return [isDarkMode, toggleTheme];
}

export default useThemeMode;
