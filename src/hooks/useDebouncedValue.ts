import { useEffect, useState } from "react";

/** Returns `value` after it has stopped changing for `delayMs`. Used to hold server-side search
 *  queries until the user pauses typing. */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}
