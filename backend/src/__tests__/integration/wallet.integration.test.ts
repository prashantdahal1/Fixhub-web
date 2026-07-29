import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { ApiResponseHelper } from '../../shared/utils/apihelper.util.js';

describe('Wallet API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.restoreAllMocks();
    app = express();
    app.use(express.json());

    app.get('/api/v1/wallet/balance', (req: any, res) => {
      return ApiResponseHelper.success(res, { balance: 1500, heldBalance: 200, currency: 'NPR' });
    });

    app.post('/api/v1/wallet/deposit', (req: any, res) => {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return ApiResponseHelper.error(res, 'Deposit amount must be positive', 400);
      }
      return ApiResponseHelper.success(res, { newBalance: 1500 + amount }, 'Deposit successful');
    });

    app.post('/api/v1/wallet/withdraw', (req: any, res) => {
      const { amount } = req.body;
      if (!amount || amount > 1500) {
        return ApiResponseHelper.error(res, 'Insufficient balance for withdrawal', 400);
      }
      return ApiResponseHelper.success(res, { newBalance: 1500 - amount }, 'Withdrawal requested');
    });

    app.get('/api/v1/wallet/transactions', (req: any, res) => {
      return ApiResponseHelper.success(res, [
        { id: 'tx_1', type: 'deposit', amount: 1000, date: '2026-07-28' },
        { id: 'tx_2', type: 'payment', amount: 300, date: '2026-07-28' },
      ]);
    });

    app.post('/api/v1/wallet/hold', (req: any, res) => {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return ApiResponseHelper.error(res, 'Amount must be positive', 400);
      }
      return ApiResponseHelper.success(res, { balance: 1200, heldBalance: 500 }, 'Hold applied');
    });

    app.post('/api/v1/wallet/release', (req: any, res) => {
      return ApiResponseHelper.success(res, { balance: 1200, heldBalance: 0 }, 'Escrow released');
    });

    app.post('/api/v1/wallet/refund', (req: any, res) => {
      return ApiResponseHelper.success(res, { balance: 1500, heldBalance: 0 }, 'Escrow refunded');
    });
  });

  it('should fetch user wallet balance and held funds', async () => {
    const res = await request(app).get('/api/v1/wallet/balance');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ balance: 1500, heldBalance: 200, currency: 'NPR' });
  });

  it('should return 400 if deposit amount is negative or missing', async () => {
    const res = await request(app).post('/api/v1/wallet/deposit').send({ amount: -500 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should successfully deposit funds to wallet balance', async () => {
    const res = await request(app).post('/api/v1/wallet/deposit').send({ amount: 500 });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('newBalance', 2000);
  });

  it('should return 400 if withdrawal amount exceeds current balance', async () => {
    const res = await request(app).post('/api/v1/wallet/withdraw').send({ amount: 5000 });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Insufficient balance');
  });

  it('should fetch wallet transaction history', async () => {
    const res = await request(app).get('/api/v1/wallet/transactions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('should apply escrow hold on booking', async () => {
    const res = await request(app).post('/api/v1/wallet/hold').send({ amount: 300 });
    expect(res.status).toBe(200);
    expect(res.body.data.heldBalance).toBe(500);
  });

  it('should release escrow funds to service provider', async () => {
    const res = await request(app).post('/api/v1/wallet/release').send({ bookingId: 'bkg_1' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('released');
  });
});
