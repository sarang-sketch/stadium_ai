import { describe, expect, it } from 'vitest';

class PricingEngine {
  compute(base: number, demand: number) {
    return Math.min(Math.max(base * demand, base), base * 3);
  }
}
interface Transaction {
  amount: number;
}
class FraudDetectionService {
  score(tx: Transaction) {
    return tx.amount > 1000 ? 0.9 : 0.1;
  }
  isFraud(tx: Transaction) {
    return this.score(tx) > 0.8;
  }
}

describe('Ticketing Service', () => {
  it('PricingEngine computes valid prices within bounds', () => {
    const svc = new PricingEngine();
    expect(svc.compute(100, 1.5)).toBe(150);
    expect(svc.compute(100, 0.5)).toBe(100);
    expect(svc.compute(100, 5.0)).toBe(300);
  });

  it('FraudDetectionService scores transactions correctly', () => {
    const svc = new FraudDetectionService();
    expect(svc.score({ amount: 100 })).toBe(0.1);
    expect(svc.score({ amount: 2000 })).toBe(0.9);
  });

  it('FraudDetectionService flags based on threshold', () => {
    const svc = new FraudDetectionService();
    expect(svc.isFraud({ amount: 2000 })).toBe(true);
    expect(svc.isFraud({ amount: 100 })).toBe(false);
  });
});
