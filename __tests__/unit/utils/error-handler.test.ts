import { describe, expect, it } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  isAppError,
  createErrorResponse,
  handleApiError,
} from '@/utils/error-handler';

describe('Error Handler Utilities', () => {
  describe('AppError hierarchy', () => {
    it('AppError carries statusCode and errorCode', () => {
      const err = new AppError('test', 500, 'INTERNAL_SERVER_ERROR');
      expect(err.message).toBe('test');
      expect(err.statusCode).toBe(500);
      expect(err.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(err instanceof Error).toBe(true);
    });

    it('ValidationError defaults to 400', () => {
      const err = new ValidationError('bad input');
      expect(err.statusCode).toBe(400);
      expect(err.errorCode).toBe('validation_error');
    });

    it('UnauthorizedError defaults to 401', () => {
      const err = new UnauthorizedError();
      expect(err.statusCode).toBe(401);
      expect(err.errorCode).toBe('unauthenticated');
    });

    it('ForbiddenError defaults to 403', () => {
      const err = new ForbiddenError();
      expect(err.statusCode).toBe(403);
      expect(err.errorCode).toBe('unauthorized');
    });

    it('NotFoundError defaults to 404', () => {
      const err = new NotFoundError();
      expect(err.statusCode).toBe(404);
      expect(err.errorCode).toBe('not_found');
    });

    it('ConflictError defaults to 409', () => {
      const err = new ConflictError();
      expect(err.statusCode).toBe(409);
      expect(err.errorCode).toBe('conflict');
    });
  });

  describe('isAppError type guard', () => {
    it('returns true for AppError instances', () => {
      expect(isAppError(new AppError('x'))).toBe(true);
      expect(isAppError(new ValidationError())).toBe(true);
      expect(isAppError(new NotFoundError())).toBe(true);
    });

    it('returns false for plain Error instances', () => {
      expect(isAppError(new Error('plain'))).toBe(false);
    });

    it('returns false for non-error values', () => {
      expect(isAppError('string')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
    });
  });

  describe('createErrorResponse', () => {
    it('returns a NextResponse with the correct status and error body', async () => {
      const res = createErrorResponse('Not found', 404, 'not_found');
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.message).toBe('Not found');
      expect(data.error.code).toBe('not_found');
    });
  });

  describe('handleApiError', () => {
    it('maps AppError to its status code', async () => {
      const res = handleApiError(new NotFoundError('Item missing'));
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.message).toBe('Item missing');
    });

    it('maps unknown Error to 500', async () => {
      const res = handleApiError(new Error('unexpected'));
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error.message).toBe('unexpected');
    });

    it('maps non-Error values to 500 with a generic message', async () => {
      const res = handleApiError('string-error');
      expect(res.status).toBe(500);
    });
  });
});
