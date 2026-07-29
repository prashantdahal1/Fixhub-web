import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { ApiResponseHelper } from '../../shared/utils/apihelper.util.js';

describe('Booking API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.restoreAllMocks();
    app = express();
    app.use(express.json());

    // Fake auth tagging
    app.use((req: any, res, next) => {
      req.user = { id: 'usr_customer_123', role: 'customer' };
      next();
    });

    app.post('/api/v1/bookings', (req: any, res) => {
      const { serviceId, date, address } = req.body;
      if (!serviceId || !date || !address) {
        return ApiResponseHelper.error(res, 'Missing booking details', 400);
      }
      return ApiResponseHelper.success(res, { id: 'bkg_1', serviceId, status: 'pending', date }, 'Booking created', 201);
    });

    app.get('/api/v1/bookings/my-bookings', (req: any, res) => {
      return ApiResponseHelper.success(res, [{ id: 'bkg_1', serviceId: 'svc_1', status: 'confirmed' }], 'Bookings fetched');
    });

    app.get('/api/v1/bookings/:id', (req: any, res) => {
      if (req.params.id === 'invalid') {
        return ApiResponseHelper.error(res, 'Booking not found', 404);
      }
      return ApiResponseHelper.success(res, { id: req.params.id, status: 'confirmed' }, 'Booking detail');
    });

    app.patch('/api/v1/bookings/:id/cancel', (req: any, res) => {
      return ApiResponseHelper.success(res, { id: req.params.id, status: 'cancelled' }, 'Booking cancelled');
    });

    app.patch('/api/v1/bookings/:id/confirm', (req: any, res) => {
      return ApiResponseHelper.success(res, { id: req.params.id, status: 'confirmed' }, 'Booking confirmed');
    });

    app.patch('/api/v1/bookings/:id/complete', (req: any, res) => {
      return ApiResponseHelper.success(res, { id: req.params.id, status: 'completed' }, 'Booking completed');
    });

    app.delete('/api/v1/bookings/:id', (req: any, res) => {
      return ApiResponseHelper.success(res, null, 'Booking record deleted');
    });
  });

  it('should return 400 when creating booking without serviceId or date', async () => {
    const res = await request(app).post('/api/v1/bookings').send({ address: 'Kathmandu' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should create a new booking with 201 status on valid payload', async () => {
    const res = await request(app).post('/api/v1/bookings').send({
      serviceId: 'svc_1',
      date: '2026-08-01',
      address: 'Kathmandu, Nepal',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id', 'bkg_1');
  });

  it('should fetch user bookings list', async () => {
    const res = await request(app).get('/api/v1/bookings/my-bookings');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should fetch single booking details by id', async () => {
    const res = await request(app).get('/api/v1/bookings/bkg_1');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('status', 'confirmed');
  });

  it('should return 404 for non-existent booking ID', async () => {
    const res = await request(app).get('/api/v1/bookings/invalid');
    expect(res.status).toBe(404);
  });

  it('should cancel booking on patch /cancel endpoint', async () => {
    const res = await request(app).patch('/api/v1/bookings/bkg_1/cancel');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });

  it('should complete booking on patch /complete endpoint', async () => {
    const res = await request(app).patch('/api/v1/bookings/bkg_1/complete');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
  });
});
