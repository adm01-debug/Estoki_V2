import { useState, useCallback } from 'react';
export function useCookie(name: string, initialValue = '') {
  const [value, setValue] = useState(() => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : initialValue;
  });
  const setCookie = useCallback((newValue: string, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(newValue)};expires=${expires};path=/`;
    setValue(newValue);
  }, [name]);
  const deleteCookie = useCallback(() => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    setValue('');
  }, [name]);
  return { value, setCookie, deleteCookie };
}
