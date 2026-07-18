import { describe, expect, it } from 'vitest';

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}
function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}
function clampValue(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}
function generateId() {
  return Math.random().toString(36).substring(7);
}
function truncateText(text: string, len: number) {
  if (text.length <= len) return text;
  return text.substring(0, len) + '...';
}

describe('Helpers', () => {
  it('formatCurrency', () => {
    expect(formatCurrency(10.5)).toBe('$10.50');
  });

  it('formatDate', () => {
    const d = new Date('2024-01-01T12:00:00Z');
    expect(formatDate(d)).toBe('2024-01-01');
  });

  it('clampValue', () => {
    expect(clampValue(5, 1, 10)).toBe(5);
    expect(clampValue(-5, 1, 10)).toBe(1);
    expect(clampValue(15, 1, 10)).toBe(10);
  });

  it('generateId', () => {
    expect(generateId()).toBeTypeOf('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('truncateText', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
    expect(truncateText('hi', 5)).toBe('hi');
  });
});
