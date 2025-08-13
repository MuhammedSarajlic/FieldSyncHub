import { useEffect, useRef } from 'react';

type ClickOutsideHandler = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside<T extends HTMLElement>(
  handler: ClickOutsideHandler,
  ignoreRefs: React.RefObject<HTMLElement>[] = []
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // if click is inside dropdown
      if (ref.current && ref.current.contains(target)) return;

      // if click is inside any ignored element (like the button)
      if (ignoreRefs.some((r) => r.current && r.current.contains(target)))
        return;

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, ignoreRefs]);

  return ref;
}
