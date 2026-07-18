'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook for keyboard navigation utilities
 */
export function useKeyboardNav(options?: {
  onEscape?: () => void;
  trapFocus?: boolean;
}) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && options?.onEscape) {
        options.onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options]);

  return { containerRef };
}
