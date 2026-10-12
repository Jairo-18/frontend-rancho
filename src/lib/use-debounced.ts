'use client';

import { useEffect, useState } from 'react';

/** Valor que se actualiza `delay` ms después del último cambio (búsquedas). */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
