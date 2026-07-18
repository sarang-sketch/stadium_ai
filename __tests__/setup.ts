/**
 * Shared Vitest setup file, loaded for every project (jsdom + node).
 *
 * - Registers jest-dom matchers (toBeInTheDocument, toHaveAttribute, etc.) for
 *   component tests. These matchers are inert/no-op in the node project since
 *   no DOM elements are ever asserted on there.
 * - Add any additional global test setup (env var defaults, global mocks)
 *   here so both projects share the same baseline.
 */
import '@testing-library/jest-dom/vitest';
