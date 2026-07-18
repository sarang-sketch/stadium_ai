import { describe, expect, it } from 'vitest';
import { POST as recommendPost } from '@/app/api/stadium/seats/recommend/route';
import { POST as fraudPost } from '@/app/api/tickets/fraud/route';
import { POST as pricingPost } from '@/app/api/tickets/pricing/route';
import { NextRequest } from 'next/server';

/**
 * Helper to build authenticated POST requests for integration tests.
 */
function createAuthenticatedPostRequest(url: string, body: Record<string, unknown>, role: 'user' | 'admin' = 'user'): NextRequest {
  const token = role === 'admin' ? 'valid-admin-token' : 'valid-user-token';
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

describe('Stadium API — Seat Recommendation Integration', () => {
  it('should return seat recommendations for valid input', async () => {
    const req = createAuthenticatedPostRequest('http://localhost:3000/api/stadium/seats/recommend', {
      budget: 150,
      groupSize: 2,
      preferences: ['shade', 'close to field'],
    });

    const response = await recommendPost(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.recommendations).toBeDefined();
    expect(Array.isArray(data.recommendations)).toBe(true);
    expect(data.recommendations.length).toBeGreaterThan(0);
    expect(data.recommendations[0].seatId).toBeDefined();
    expect(data.recommendations[0].score).toBeGreaterThan(0);
  });

  it('should return 400 for missing budget field', async () => {
    const req = createAuthenticatedPostRequest('http://localhost:3000/api/stadium/seats/recommend', {
      groupSize: 2,
      preferences: ['shade'],
    });

    const response = await recommendPost(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const req = new NextRequest('http://localhost:3000/api/stadium/seats/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: 100, groupSize: 1, preferences: [] }),
    });

    const response = await recommendPost(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(401);
  });
});

describe('Ticketing API — Fraud Detection Integration', () => {
  it('should score a transaction for fraud risk', async () => {
    const req = createAuthenticatedPostRequest(
      'http://localhost:3000/api/tickets/fraud',
      {
        transactionId: 'tx-integration-1',
        signals: { accountAgeDays: 0.5, purchasesLastHour: 8, ipCountry: 'US' },
      },
      'admin'
    );

    const response = await fraudPost(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.transactionId).toBe('tx-integration-1');
    expect(data.riskScore).toBeGreaterThanOrEqual(0);
    expect(data.riskScore).toBeLessThanOrEqual(100);
    expect(typeof data.flagged).toBe('boolean');
    expect(data.source).toBeDefined();
  });

  it('should require admin role for fraud scoring', async () => {
    // Use a user-role token instead of admin
    const req = createAuthenticatedPostRequest(
      'http://localhost:3000/api/tickets/fraud',
      {
        transactionId: 'tx-integration-2',
        signals: { accountAgeDays: 30 },
      },
      'user'
    );

    const response = await fraudPost(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(403);
  });
});

describe('Ticketing API — Dynamic Pricing Integration', () => {
  it('should reject pricing rule creation without admin role', async () => {
    const req = createAuthenticatedPostRequest(
      'http://localhost:3000/api/tickets/pricing',
      {
        tournamentId: 'tourney-pricing-2',
        category: 'General',
        minPrice: 20,
        maxPrice: 100,
      },
      'user'
    );

    const response = await pricingPost(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(403);
  });

  it('should reject pricing rule with invalid schema (maxPrice < minPrice)', async () => {
    const req = createAuthenticatedPostRequest(
      'http://localhost:3000/api/tickets/pricing',
      {
        tournamentId: 'tourney-pricing-3',
        category: 'VIP',
        minPrice: 200,
        maxPrice: 50, // invalid: max < min
      },
      'admin'
    );

    const response = await pricingPost(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('validation_error');
  });
});
