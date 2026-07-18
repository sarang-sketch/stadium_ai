import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { MockSecretsAdapter, createSecretsAdapter } from '@/adapters/secrets.adapter';

describe('Secrets Adapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should read from process.env', async () => {
    process.env.TEST_SECRET = 'secret_val';
    const adapter = new MockSecretsAdapter();
    const val = await adapter.getSecret('TEST_SECRET');
    expect(val).toBe('secret_val');
  });

  it('should return null for missing env vars', async () => {
    const adapter = new MockSecretsAdapter();
    const val = await adapter.getSecret('MISSING_SECRET');
    expect(val).toBeNull();
  });

  it('should return value for set env vars', async () => {
    process.env.MY_SECRET = '12345';
    const adapter = new MockSecretsAdapter();
    const val = await adapter.getSecret('MY_SECRET');
    expect(val).toBe('12345');
  });

  it('createSecretsAdapter returns a working adapter', async () => {
    process.env.FACTORY_SECRET = 'factory_val';
    const adapter = createSecretsAdapter();
    const val = await adapter.getSecret('FACTORY_SECRET');
    expect(val).toBe('factory_val');
  });
});
