/**
 * Pagination utilities for API routes.
 *
 * Centralises the repeated parse-and-slice pagination logic used by
 * every `GET` list endpoint, ensuring consistent parameter handling,
 * bounds validation, and response shaping across the API surface.
 *
 * @module utils/pagination
 */

import type { PaginatedResult } from '@/types/api.types';

/** Configuration defaults for a paginated endpoint. */
export interface PaginationDefaults {
  /** Default page size when the caller omits `pageSize`. */
  defaultPageSize: number;
  /** Upper bound for `pageSize`; requests above this are clamped. */
  maxPageSize: number;
}

/**
 * Parsed and validated pagination parameters extracted from a request.
 */
export interface PaginationParams {
  /** The 1-based page number, guaranteed to be ≥ 1. */
  page: number;
  /** The clamped page size, guaranteed to satisfy `1 ≤ pageSize ≤ maxPageSize`. */
  pageSize: number;
}

/**
 * Parses `page` and `pageSize` from URL search parameters, applying
 * safe defaults and clamping to the configured bounds.
 *
 * @param searchParams - The `URLSearchParams` from the request URL.
 * @param defaults - Optional overrides for the default and maximum page size.
 * @returns Validated pagination parameters.
 *
 * @example
 * ```ts
 * const { page, pageSize } = parsePagination(req.nextUrl.searchParams);
 * ```
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults: PaginationDefaults = { defaultPageSize: 20, maxPageSize: 100 }
): PaginationParams {
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const pageSize = Math.min(
    defaults.maxPageSize,
    Math.max(1, Number(searchParams.get('pageSize') ?? String(defaults.defaultPageSize)) || defaults.defaultPageSize)
  );
  return { page, pageSize };
}

/**
 * Slices an in-memory array into a single page and wraps it in the
 * standard `PaginatedResult` envelope.
 *
 * @typeParam T - The item type.
 * @param items - The full, unpaginated array of items.
 * @param page - The 1-based page number.
 * @param pageSize - The number of items per page.
 * @returns A `PaginatedResult<T>` containing the sliced items and pagination metadata.
 *
 * @example
 * ```ts
 * const result = paginate(allSeats, page, pageSize);
 * return NextResponse.json(result);
 * ```
 */
export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
  };
}
