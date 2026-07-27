import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { WalletService } from '../../modules/wallet/wallet.service.js';
import { WalletModel } from '../../models/wallet.model.js';
import { TransactionModel } from '../../models/transaction.model.js';
import { HttpException } from '../../shared/exceptions/http-exception.js';

describe('WalletService Unit Tests', () => {
  let walletService: WalletService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    walletService = new WalletService();
  });

  describe('getOrCreateWallet()', () => {
    it('should return existing wallet if one exists', async () => {
      const mockWallet = { _id: 'w1', userId: 'usr1', balance: 1000, held: 0 };
      jest.spyOn(WalletModel, 'findOne').mockResolvedValueOnce(mockWallet as any);

      const result = await walletService.getOrCreateWallet('usr1');
      expect(result).toEqual(mockWallet);
    });

    it('should create and return a new wallet if none exists', async () => {
      const newWallet = { _id: 'w2', userId: 'usr2', balance: 0, held: 0 };
      jest.spyOn(WalletModel, 'findOne').mockResolvedValueOnce(null as any);
      jest.spyOn(WalletModel, 'create').mockResolvedValueOnce(newWallet as any);

      const result = await walletService.getOrCreateWallet('usr2');
      expect(result).toEqual(newWallet);
      expect(WalletModel.create).toHaveBeenCalledWith({ userId: 'usr2', balance: 0, held: 0 });
    });
  });

  describe('topUp()', () => {
    it('should throw HttpException(400) if topup amount is zero or negative', async () => {
      await expect(walletService.topUp('usr1', 0)).rejects.toThrow(HttpException);
      await expect(walletService.topUp('usr1', -100)).rejects.toThrow(HttpException);
    });

    it('should update wallet balance and create transaction on valid topup', async () => {
      const updatedWallet = { _id: 'w1', userId: 'usr1', balance: 1500, held: 0 };
      jest.spyOn(WalletModel, 'findOneAndUpdate').mockResolvedValueOnce(updatedWallet as any);
      jest.spyOn(TransactionModel, 'create').mockResolvedValueOnce({} as any);

      const result = await walletService.topUp('usr1', 500);
      expect(result.balance).toBe(1500);
      expect(TransactionModel.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'topup', amount: 500 }));
    });

    it('should throw HttpException(500) if wallet update returns null', async () => {
      jest.spyOn(WalletModel, 'findOneAndUpdate').mockResolvedValueOnce(null as any);
      await expect(walletService.topUp('usr1', 500)).rejects.toThrow(HttpException);
    });
  });

  describe('hold()', () => {
    it('should throw HttpException when balance is insufficient', async () => {
      jest.spyOn(WalletModel, 'findOne').mockResolvedValueOnce({ balance: 100, held: 0 } as any);
      await expect(walletService.hold('usr1', 500, 'bkg_1')).rejects.toThrow(HttpException);
    });

    it('should throw HttpException when wallet update returns null (race condition)', async () => {
      jest.spyOn(WalletModel, 'findOne').mockResolvedValueOnce({ balance: 1000, held: 0 } as any);
      jest.spyOn(WalletModel, 'findOneAndUpdate').mockResolvedValueOnce(null as any);
      await expect(walletService.hold('usr1', 500, 'bkg_1')).rejects.toThrow(HttpException);
    });

    it('should deduct balance, increase held, and create hold transaction', async () => {
      const mockWallet = { balance: 1000, held: 0 };
      const updatedWallet = { balance: 500, held: 500 };
      jest.spyOn(WalletModel, 'findOne').mockResolvedValueOnce(mockWallet as any);
      jest.spyOn(WalletModel, 'findOneAndUpdate').mockResolvedValueOnce(updatedWallet as any);
      jest.spyOn(TransactionModel, 'create').mockResolvedValueOnce({} as any);

      const result = await walletService.hold('usr1', 500, '507f1f77bcf86cd799439011');
      expect(result.held).toBe(500);
      expect(result.balance).toBe(500);
    });
  });

  describe('refund()', () => {
    it('should throw HttpException if held funds are insufficient for refund', async () => {
      jest.spyOn(WalletModel, 'findOne').mockResolvedValueOnce({ balance: 0, held: 100 } as any);
      await expect(walletService.refund('usr1', 500, 'bkg_1')).rejects.toThrow(HttpException);
    });

    it('should refund held funds back to balance and create refund transaction', async () => {
      const mockWallet = { balance: 0, held: 500 };
      const updatedWallet = { balance: 500, held: 0 };
      jest.spyOn(WalletModel, 'findOne').mockResolvedValueOnce(mockWallet as any);
      jest.spyOn(WalletModel, 'findOneAndUpdate').mockResolvedValueOnce(updatedWallet as any);
      jest.spyOn(TransactionModel, 'create').mockResolvedValueOnce({} as any);

      const result = await walletService.refund('usr1', 500, '507f1f77bcf86cd799439011');
      expect(result.balance).toBe(500);
      expect(result.held).toBe(0);
    });
  });
});
