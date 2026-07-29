import { describe, it, expect } from '@jest/globals';
import { HttpException } from '../../shared/exceptions/http-exception.js';

describe('HttpException Unit Tests', () => {
  it('should create an instance with correct status and message', () => {
    const err = new HttpException(404, 'Not Found');
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not Found');
  });

  it('should be an instance of Error', () => {
    const err = new HttpException(500, 'Internal Server Error');
    expect(err).toBeInstanceOf(Error);
  });

  it('should correctly set 400 Bad Request', () => {
    const err = new HttpException(400, 'Bad Request');
    expect(err.status).toBe(400);
    expect(err.message).toBe('Bad Request');
  });

  it('should correctly set 401 Unauthorized', () => {
    const err = new HttpException(401, 'Unauthorized');
    expect(err.status).toBe(401);
  });

  it('should correctly set 403 Forbidden', () => {
    const err = new HttpException(403, 'Forbidden');
    expect(err.status).toBe(403);
  });

  it('should correctly set 409 Conflict', () => {
    const err = new HttpException(409, 'Conflict - resource already exists');
    expect(err.status).toBe(409);
    expect(err.message).toContain('already exists');
  });

  it('should have a name equal to Error', () => {
    const err = new HttpException(500, 'Server error');
    expect(err.name).toBe('Error');
  });
});
