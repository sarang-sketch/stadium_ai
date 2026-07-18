import { describe, expect, it } from 'vitest';
import { parsePagination, paginate } from '@/utils/pagination';

describe('Pagination Utility', () => {
  describe('parsePagination', () => {
    it('returns default values when no params are provided', () => {
      const params = new URLSearchParams();
      const result = parsePagination(params);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('parses valid page and pageSize from search params', () => {
      const params = new URLSearchParams({ page: '3', pageSize: '50' });
      const result = parsePagination(params);

      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(50);
    });

    it('clamps page to minimum of 1', () => {
      const params = new URLSearchParams({ page: '-5' });
      const result = parsePagination(params);

      expect(result.page).toBe(1);
    });

    it('clamps pageSize to maximum allowed value', () => {
      const params = new URLSearchParams({ pageSize: '9999' });
      const result = parsePagination(params, { defaultPageSize: 20, maxPageSize: 100 });

      expect(result.pageSize).toBe(100);
    });

    it('falls back to default when pageSize is zero', () => {
      const params = new URLSearchParams({ pageSize: '0' });
      const result = parsePagination(params);

      // Number('0') is 0 which is falsy, so the `|| defaultPageSize` fallback kicks in
      expect(result.pageSize).toBe(20);
    });

    it('uses custom defaults when provided', () => {
      const params = new URLSearchParams();
      const result = parsePagination(params, { defaultPageSize: 50, maxPageSize: 500 });

      expect(result.pageSize).toBe(50);
    });

    it('handles non-numeric values gracefully', () => {
      const params = new URLSearchParams({ page: 'abc', pageSize: 'xyz' });
      const result = parsePagination(params);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  describe('paginate', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    it('returns the correct page of items', () => {
      const result = paginate(items, 1, 10);

      expect(result.items.length).toBe(10);
      expect(result.items[0].id).toBe(1);
      expect(result.items[9].id).toBe(10);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('returns the second page correctly', () => {
      const result = paginate(items, 2, 10);

      expect(result.items.length).toBe(10);
      expect(result.items[0].id).toBe(11);
    });

    it('returns a partial last page', () => {
      const result = paginate(items, 3, 10);

      expect(result.items.length).toBe(5);
      expect(result.items[0].id).toBe(21);
    });

    it('returns empty items for an out-of-range page', () => {
      const result = paginate(items, 100, 10);

      expect(result.items.length).toBe(0);
      expect(result.total).toBe(25);
    });

    it('handles an empty array', () => {
      const result = paginate([], 1, 10);

      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});
