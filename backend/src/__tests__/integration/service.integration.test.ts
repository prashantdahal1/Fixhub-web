import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { ServiceController } from '../../modules/service/service.controller.js';
import { ServiceService } from '../../modules/service/service.service.js';

describe('Service API Integration Tests', () => {
  let app: express.Application;
  let serviceController: ServiceController;

  beforeEach(() => {
    jest.restoreAllMocks();
    app = express();
    app.use(express.json());
    serviceController = new ServiceController();

    app.get('/api/v1/services', (req, res) => serviceController.getServices(req, res));
    app.get('/api/v1/services/:id', (req, res) => serviceController.getServiceById(req, res));
    app.post('/api/v1/services', (req, res) => serviceController.createService(req, res));
    app.delete('/api/v1/services/:id', (req, res) => serviceController.deleteService(req, res));
  });

  describe('GET /api/v1/services', () => {
    it('should return paginated list of services with default pagination', async () => {
      const mockServices = [
        { id: '1', title: 'Plumbing Service', basePrice: 50, category: 'Plumbing' },
        { id: '2', title: 'Electrical Repair', basePrice: 75, category: 'Electrical' },
      ];

      jest.spyOn(ServiceService.prototype, 'getServices').mockResolvedValueOnce({
        data: mockServices as any,
        page: 1,
        limit: 12,
        total: 2,
      });

      const res = await request(app).get('/api/v1/services');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta).toEqual({ page: 1, limit: 12, total: 2 });
    });

    it('should filter services by category when query param is passed', async () => {
      jest.spyOn(ServiceService.prototype, 'getServices').mockResolvedValueOnce({
        data: [{ id: '1', title: 'Plumbing', category: 'plumber' }] as any,
        page: 1,
        limit: 12,
        total: 1,
      });

      const res = await request(app).get('/api/v1/services?category=plumber');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should search services by title query string', async () => {
      jest.spyOn(ServiceService.prototype, 'getServices').mockResolvedValueOnce({
        data: [{ id: '2', title: 'AC Repair' }] as any,
        page: 1,
        limit: 12,
        total: 1,
      });

      const res = await request(app).get('/api/v1/services?search=AC');

      expect(res.status).toBe(200);
      expect(res.body.data[0].title).toBe('AC Repair');
    });
  });

  describe('GET /api/v1/services/:id', () => {
    it('should return service detail by id', async () => {
      const mockService = { id: 'svc123', title: 'Cleaning Service', basePrice: 40 };
      jest.spyOn(ServiceService.prototype, 'getServiceById').mockResolvedValueOnce(mockService as any);

      const res = await request(app).get('/api/v1/services/svc123');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockService);
    });

    it('should return 404 if service does not exist', async () => {
      jest.spyOn(ServiceService.prototype, 'getServiceById').mockRejectedValueOnce({
        message: 'Service not found',
        status: 404,
      });

      const res = await request(app).get('/api/v1/services/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST & DELETE /api/v1/services', () => {
    it('should return 400 if required fields are missing on create', async () => {
      const res = await request(app)
        .post('/api/v1/services')
        .send({ title: 'Missing Price' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Missing required service fields');
    });

    it('should successfully delete service by id', async () => {
      jest.spyOn(ServiceService.prototype, 'deleteService').mockResolvedValueOnce(true as any);

      const res = await request(app).delete('/api/v1/services/svc123');

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });
});
