import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { ApiResponseHelper } from '../../shared/utils/apihelper.util.js';
import { type Response } from 'express';

describe('ApiResponseHelper Unit Tests', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('success()', () => {
    it('should return a standard success response with default parameters', () => {
      const data = { id: 1, name: 'Test' };
      ApiResponseHelper.success(mockRes as Response, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: 'Success',
        data,
        meta: undefined,
      });
    });

    it('should return custom status, message, and metadata when provided', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const meta = { page: 1, limit: 10, total: 2 };
      ApiResponseHelper.success(mockRes as Response, data, 'Fetched items', 201, meta);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 201,
        success: true,
        message: 'Fetched items',
        data,
        meta,
      });
    });

    it('should correctly handle null or empty data payloads', () => {
      ApiResponseHelper.success(mockRes as Response, null, 'No content', 204);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 204,
        success: true,
        message: 'No content',
        data: null,
        meta: undefined,
      });
    });
  });

  describe('error()', () => {
    it('should return a standard error response with default parameters', () => {
      ApiResponseHelper.error(mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 500,
        success: false,
        message: 'Error',
        data: null,
      });
    });

    it('should return custom error message and status code', () => {
      ApiResponseHelper.error(mockRes as Response, 'Resource not found', 404);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 404,
        success: false,
        message: 'Resource not found',
        data: null,
      });
    });

    it('should handle unauthorized or forbidden error status codes', () => {
      ApiResponseHelper.error(mockRes as Response, 'Access denied', 403);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 403,
        success: false,
        message: 'Access denied',
        data: null,
      });
    });
  });
});
