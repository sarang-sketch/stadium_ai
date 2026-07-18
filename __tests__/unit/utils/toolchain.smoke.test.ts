import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

/**
 * Smoke test confirming the Vitest "node" project runs, resolves the `@/*`
 * path aliases correctly, and can import real `src/` modules. Replace/remove
 * once real unit tests for `src/utils` exist.
 */
describe('vitest node project toolchain', () => {
  it('runs in a node environment', () => {
    expect(typeof window).toBe('undefined');
  });

  it('resolves the @/* path alias to src/', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });
});
