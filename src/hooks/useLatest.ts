import { useLayoutEffect, useRef } from 'react';

/** A ref that always holds the latest value, for listeners that shouldn't re-subscribe every render. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
