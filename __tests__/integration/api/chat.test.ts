import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

describe('API Chat Integration', () => {
  it('should process a valid chat message successfully', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-user-token',
      },
      body: JSON.stringify({
        message: 'Hello, how can I navigate the stadium?',
        targetLanguage: 'en',
        isAudio: false,
      }),
    });

    const response = await POST(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBeDefined();
    expect(data.source).toBeDefined();
    expect(typeof data.message).toBe('string');
  });

  it('should return 400 validation error for empty or invalid message', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-user-token',
      },
      body: JSON.stringify({
        message: '',
        targetLanguage: 'en',
      }),
    });

    const response = await POST(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('validation_error');
    expect(data.details).toBeDefined();
  });

  it('should return 401 unauthenticated if authorization header is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message',
      }),
    });

    const response = await POST(req, { params: Promise.resolve({}) });
    expect(response.status).toBe(401);
  });
});
