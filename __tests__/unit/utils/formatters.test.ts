import { describe, expect, it } from 'vitest';

function formatPercentage(val: number) {
  return `${(val * 100).toFixed(1)}%`;
}
function formatOccupancy(count: number, max: number) {
  return `${count}/${max}`;
}
function formatRiskScore(score: number) {
  if (score > 0.8) return 'High';
  if (score > 0.5) return 'Medium';
  return 'Low';
}
function formatMatchStatus(status: string) {
  return status.toUpperCase();
}

describe('Formatters', () => {
  it('formatPercentage', () => {
    expect(formatPercentage(0.456)).toBe('45.6%');
  });

  it('formatOccupancy', () => {
    expect(formatOccupancy(50, 100)).toBe('50/100');
  });

  it('formatRiskScore', () => {
    expect(formatRiskScore(0.9)).toBe('High');
    expect(formatRiskScore(0.6)).toBe('Medium');
    expect(formatRiskScore(0.2)).toBe('Low');
  });

  it('formatMatchStatus', () => {
    expect(formatMatchStatus('live')).toBe('LIVE');
  });
});
