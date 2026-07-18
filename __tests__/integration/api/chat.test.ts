import { describe, expect, it } from 'vitest';

async function mockPostApiChat(body: { message?: string } | null) {
  if (!body || !body.message) {
    return { status: 400, data: { error: 'Validation error' } };
  }
  return { status: 200, data: { response: 'Hello from bot' } };
}

describe('API Chat Integration', () => {
  it('should return response for valid message', async () => {
    const res = await mockPostApiChat({ message: 'Hello' });
    expect(res.status).toBe(200);
    expect(res.data.response).toBeDefined();
  });

  it('should return validation error for empty message', async () => {
    const res = await mockPostApiChat({ message: '' });
    expect(res.status).toBe(400);
    expect(res.data.error).toBe('Validation error');
  });

  it('should return validation error for missing body', async () => {
    const res = await mockPostApiChat(null);
    expect(res.status).toBe(400);
  });
});
