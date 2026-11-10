import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOffline(false);
    const setIsOffline = (status: boolean) => setIsOnline(!status);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  return isOnline;
}
