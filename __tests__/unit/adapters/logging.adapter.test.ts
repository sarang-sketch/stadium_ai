import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MockLoggingAdapter, createLoggingAdapter } from '@/adapters/logging.adapter';

describe('Logging Adapter', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should write to console', () => {
    const adapter = new MockLoggingAdapter();
    adapter.log('INFO', 'Test');
    expect(logSpy).toHaveBeenCalled();
  });

  it('should route ERROR severity to console.error', () => {
    const adapter = new MockLoggingAdapter();
    adapter.log('ERROR', 'Error test');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should support convenience methods', () => {
    const adapter = new MockLoggingAdapter();
    adapter.debug('debug');
    adapter.info('info');
    adapter.warn('warn');
    adapter.error('error');
    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it('createLoggingAdapter returns a working adapter', () => {
    const adapter = createLoggingAdapter();
    adapter.info('info');
    expect(logSpy).toHaveBeenCalled();
  });
});
