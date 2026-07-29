import mongoose from "mongoose";
import { WalletModel, type IWallet } from "../../models/wallet.model.js";
import { TransactionModel } from "../../models/transaction.model.js";
import { HttpException } from "../../shared/exceptions/http-exception.js";
import { applyHold, applyRefund, applyRelease } from "../../shared/utils/escrow-math.js";

export class WalletService {
  async getOrCreateWallet(userId: string): Promise<IWallet> {
    let wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      wallet = await WalletModel.create({ userId, balance: 0, held: 0 });
    }
    return wallet;
  }

  async getWallet(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const transactions = await TransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    return { wallet, transactions };
  }

  async topUp(userId: string, amount: number): Promise<IWallet> {
    if (amount <= 0) {
      throw new HttpException(400, "Top-up amount must be positive");
    }
    const wallet = await WalletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!wallet) {
      throw new HttpException(500, "Failed to top up wallet");
    }
    await TransactionModel.create({
      userId,
      type: "topup",
      amount,
      note: "Demo wallet top-up",
    });
    return wallet;
  }

  async verifyAndApplyGatewayTopUp(
    userId: string,
    amount: number,
    gateway: "esewa" | "khalti",
    gatewayTransactionId: string
  ): Promise<IWallet> {
    if (amount <= 0) {
      throw new HttpException(400, "Top-up amount must be positive");
    }

    const existingTx = await TransactionModel.findOne({ gatewayTransactionId });
    if (existingTx) {
      const wallet = await this.getOrCreateWallet(userId);
      return wallet;
    }

    const wallet = await WalletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!wallet) {
      throw new HttpException(500, "Failed to top up wallet");
    }

    await TransactionModel.create({
      userId,
      type: "topup",
      amount,
      gateway,
      gatewayTransactionId,
      note: `${gateway.toUpperCase()} wallet top-up (Tx: ${gatewayTransactionId})`,
    });

    return wallet;
  }

  /** Move funds from balance → held (escrow). Atomic. */
  async hold(userId: string, amount: number, bookingId: string): Promise<IWallet> {
    const current = await this.getOrCreateWallet(userId);
    try {
      applyHold(current.balance, current.held, amount);
    } catch (err: any) {
      throw new HttpException(
        400,
        err.message === "Insufficient balance"
          ? "Insufficient wallet balance. Please top up first."
          : err.message
      );
    }

    const wallet = await WalletModel.findOneAndUpdate(
      { userId, balance: { $gte: amount } },
      { $inc: { balance: -amount, held: amount } },
      { new: true }
    );
    if (!wallet) {
      throw new HttpException(400, "Insufficient wallet balance. Please top up first.");
    }
    await TransactionModel.create({
      userId,
      type: "hold",
      amount,
      bookingId: new mongoose.Types.ObjectId(bookingId),
      note: "Escrow hold for booking",
    });
    return wallet;
  }

  /** Release held funds to professional's available balance. */
  async release(
    customerId: string,
    professionalId: string,
    amount: number,
    bookingId: string
  ): Promise<void> {
    const current = await this.getOrCreateWallet(customerId);
    try {
      applyRelease(current.held, amount);
    } catch {
      throw new HttpException(400, "Escrow hold not found or insufficient held funds");
    }

    const customerWallet = await WalletModel.findOneAndUpdate(
      { userId: customerId, held: { $gte: amount } },
      { $inc: { held: -amount } },
      { new: true }
    );
    if (!customerWallet) {
      throw new HttpException(400, "Escrow hold not found or insufficient held funds");
    }

    await WalletModel.findOneAndUpdate(
      { userId: professionalId },
      { $inc: { balance: amount } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const bookingOid = new mongoose.Types.ObjectId(bookingId);
    await TransactionModel.create([
      {
        userId: customerId,
        type: "release",
        amount,
        bookingId: bookingOid,
        note: "Escrow released to professional",
      },
      {
        userId: professionalId,
        type: "release",
        amount,
        bookingId: bookingOid,
        note: "Payment received from escrow",
      },
    ]);
  }

  /** Refund held funds back to customer balance. */
  async refund(userId: string, amount: number, bookingId: string): Promise<IWallet> {
    const current = await this.getOrCreateWallet(userId);
    try {
      applyRefund(current.balance, current.held, amount);
    } catch {
      throw new HttpException(400, "No escrow funds to refund");
    }

    const wallet = await WalletModel.findOneAndUpdate(
      { userId, held: { $gte: amount } },
      { $inc: { held: -amount, balance: amount } },
      { new: true }
    );
    if (!wallet) {
      throw new HttpException(400, "No escrow funds to refund");
    }
    await TransactionModel.create({
      userId,
      type: "refund",
      amount,
      bookingId: new mongoose.Types.ObjectId(bookingId),
      note: "Escrow refunded on cancellation",
    });
    return wallet;
  }
}

export const walletService = new WalletService();
