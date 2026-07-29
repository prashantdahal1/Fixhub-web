import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { jwtAuth } from '../../shared/middlewares/jwtAuth.middleware.js';
import { adminMiddleware } from '../../shared/middlewares/authorized.middleware.ts';
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../../config/constants.js';

describe('Middlewares Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFn = jest.fn();
  });

  describe('jwtAuth Middleware', () => {
    it('should return 401 if authorization header is missing', async () => {
      await jwtAuth(mockReq as Request, mockRes as Response, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header format is invalid', async () => {
      mockReq.headers = { authorization: 'Basic token123' };
      await jwtAuth(mockReq as Request, mockRes as Response, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid or expired', async () => {
      mockReq.headers = { authorization: 'Bearer invalid_token' };
      await jwtAuth(mockReq as Request, mockRes as Response, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should attach decoded user payload to request and call next() on valid token', async () => {
      const payload = { id: 'user123', email: 'test@example.com', role: 'customer' };
      const validToken = jwt.sign(payload, SECRET_KEY);
      mockReq.headers = { authorization: `Bearer ${validToken}` };

      await jwtAuth(mockReq as Request, mockRes as Response, nextFn);

      expect(mockReq.user).toBeDefined();
      expect((mockReq.user as any).id).toBe('user123');
      expect(nextFn).toHaveBeenCalled();
    });
  });

  describe('adminMiddleware', () => {
    it('should return 401 if req.user is undefined', async () => {
      mockReq.user = undefined;
      await adminMiddleware(mockReq as Request, mockRes as Response, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should return 403 if req.user is not an admin', async () => {
      mockReq.user = { role: 'customer' } as any;
      await adminMiddleware(mockReq as Request, mockRes as Response, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should call next() if req.user role is admin', async () => {
      mockReq.user = { role: 'admin' } as any;
      await adminMiddleware(mockReq as Request, mockRes as Response, nextFn);

      expect(nextFn).toHaveBeenCalled();
    });
  });
});
