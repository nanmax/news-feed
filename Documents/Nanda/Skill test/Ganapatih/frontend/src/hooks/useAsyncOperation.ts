import { useEffect, useRef, useState } from 'react';

export const useAsyncOperation = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const executeAsync = async (asyncFn: () => Promise<void>) => {
    try {
      await asyncFn();
    } catch (error) {
      if (isMountedRef.current) {
        throw error; // Only throw if component is still mounted
      }
    }
  };

  return { executeAsync, isMounted: () => isMountedRef.current };
};

export const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};