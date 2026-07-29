import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { ApiResponseHelper } from '../../shared/utils/apihelper.util.js';

describe('User API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.restoreAllMocks();
    app = express();
    app.use(express.json());

    app.get('/api/v1/users/profile', (req: any, res) => {
      const auth = req.headers.authorization;
      if (!auth) return ApiResponseHelper.error(res, 'Unauthorized', 401);
      return ApiResponseHelper.success(res, { id: 'usr_1', email: 'john@example.com', role: 'customer' });
    });

    app.put('/api/v1/users/profile', (req: any, res) => {
      const { firstName, lastName } = req.body;
      if (!firstName || !lastName) {
        return ApiResponseHelper.error(res, 'First name and last name are required', 400);
      }
      return ApiResponseHelper.success(res, { id: 'usr_1', firstName, lastName }, 'Profile updated');
    });

    app.get('/api/v1/users/admin/all', (req: any, res) => {
      return ApiResponseHelper.success(res, [{ id: 'usr_1' }, { id: 'usr_2' }], 'Users fetched', 200, { page: 1, limit: 10, total: 2 });
    });

    app.patch('/api/v1/users/:id/verify', (req: any, res) => {
      return ApiResponseHelper.success(res, { id: req.params.id, isVerified: true }, 'Professional verified');
    });

    app.delete('/api/v1/users/:id', (req: any, res) => {
      return ApiResponseHelper.success(res, null, 'User deleted');
    });

    app.post('/api/v1/users/change-password', (req: any, res) => {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return ApiResponseHelper.error(res, 'Both old and new passwords are required', 400);
      }
      return ApiResponseHelper.success(res, null, 'Password changed successfully');
    });

    app.get('/api/v1/users/professionals/unverified', (req: any, res) => {
      return ApiResponseHelper.success(res, [{ id: 'pro_1', role: 'professional', isVerified: false }]);
    });
  });

  it('should return 401 when fetching profile without authorization token', async () => {
    const res = await request(app).get('/api/v1/users/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return profile information when valid authorization token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', 'Bearer valid_token_123');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email', 'john@example.com');
  });

  it('should return 400 when updating profile without required fields', async () => {
    const res = await request(app).put('/api/v1/users/profile').send({ firstName: 'John' });
    expect(res.status).toBe(400);
  });

  it('should update user profile details', async () => {
    const res = await request(app).put('/api/v1/users/profile').send({ firstName: 'John', lastName: 'Doe' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ firstName: 'John', lastName: 'Doe' });
  });

  it('should fetch all users list for admin view', async () => {
    const res = await request(app).get('/api/v1/users/admin/all');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('should verify professional account status', async () => {
    const res = await request(app).patch('/api/v1/users/pro_1/verify');
    expect(res.status).toBe(200);
    expect(res.body.data.isVerified).toBe(true);
  });

  it('should delete user by id', async () => {
    const res = await request(app).delete('/api/v1/users/usr_1');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });
});
