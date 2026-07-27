import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import authRouter from '../../modules/auth/auth.route.js';
import { UserService } from '../../modules/user/user.service.js';
import { UserModel } from '../../models/user.model.js';

describe('Auth API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.restoreAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRouter);
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'Password123!' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 and auth token on valid credentials', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com', role: 'customer' };
      jest.spyOn(UserService.prototype, 'loginUser').mockResolvedValueOnce({
        user: mockUser as any,
        token: 'mocked_jwt_token',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token', 'mocked_jwt_token');
    });

    it('should return error response when login service throws an error', async () => {
      jest.spyOn(UserService.prototype, 'loginUser').mockRejectedValueOnce({
        message: 'Invalid password',
        status: 400,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return 400 if email is missing from body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 message when email is provided', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null as any);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'valid@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('should return 400 if password is shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'validtoken', newPassword: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('at least 8 characters');
    });
  });
});
