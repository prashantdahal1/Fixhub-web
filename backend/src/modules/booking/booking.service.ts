import { BookingModel, type BookingAction, type IBooking } from "../../models/booking.model.js";
import { ServiceModel } from "../../models/service.model.js";
import { HttpException } from "../../shared/exceptions/http-exception.js";
import { walletService } from "../wallet/wallet.service.js";
import { resolveNextStatus } from "./booking-state.js";
import type { CreateBookingDTO } from "../../dtos/marketplace.dto.js";
import type { IUser } from "../../models/user.model.js";
import { createNotification } from "../../shared/utils/notification.util.js";
import { broadcastRealtimeEvent } from "../../shared/utils/realtime.util.js";

export class BookingService {
  async createBooking(customer: IUser, data: CreateBookingDTO): Promise<IBooking> {
    if (customer.role !== "customer" && customer.role !== "admin") {
      throw new HttpException(403, "Only customers can create bookings");
    }

    const service = await ServiceModel.findById(data.serviceId);
    if (!service || !service.isActive) {
      throw new HttpException(404, "Service not found or inactive");
    }

    const scheduledAt = new Date(data.scheduledAt);
    if (scheduledAt.getTime() < Date.now() - 60_000) {
      throw new HttpException(400, "scheduledAt must be in the future");
    }

    const promoCode = data.promoCode?.trim().toUpperCase();
    const discount = 0;

    // Create booking in confirmed state, then hold escrow; roll back on hold failure
    let booking: IBooking;
    try {
      booking = await BookingModel.create({
        customerId: customer._id,
        professionalId: service.professionalId,
        serviceId: service._id,
        scheduledAt,
        address: data.address,
        notes: data.notes || "",
        amount: service.basePrice,
        discount,
        status: "confirmed",
        escrowStatus: "none",
        ...(promoCode ? { promoCode } : {}),
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new HttpException(
          409,
          "This time slot is already booked. Please choose a different slot."
        );
      }
      throw err;
    }

    return booking;
  }

  async getMyBookings(user: IUser): Promise<IBooking[]> {
    const filter =
      user.role === "professional"
        ? { professionalId: user._id }
        : user.role === "admin"
          ? {}
          : { customerId: user._id };

    return BookingModel.find(filter)
      .populate("serviceId", "title slug category basePrice imageUrl")
      .populate("customerId", "firstName lastName email phoneNumber")
      .populate("professionalId", "firstName lastName email phoneNumber averageRating")
      .sort({ createdAt: -1 });
  }

  async getBookingById(id: string, user: IUser): Promise<IBooking> {
    const booking = await BookingModel.findById(id)
      .populate("serviceId", "title slug category basePrice imageUrl")
      .populate("customerId", "firstName lastName email phoneNumber")
      .populate("professionalId", "firstName lastName email phoneNumber averageRating");

    if (!booking) {
      throw new HttpException(404, "Booking not found");
    }
    this.assertCanView(booking, user);
    return booking;
  }

  async updateStatus(id: string, action: BookingAction, user: IUser): Promise<IBooking> {
    const booking = await BookingModel.findById(id);
    if (!booking) {
      throw new HttpException(404, "Booking not found");
    }

    this.assertCanAct(booking, action, user);

    let nextStatus;
    try {
      nextStatus = resolveNextStatus(booking.status, action);
    } catch {
      throw new HttpException(
        400,
        `Cannot '${action}' a booking that is '${booking.status}'`
      );
    }

    // Optimistic lock on status to prevent race conditions
    const updated = await BookingModel.findOneAndUpdate(
      { _id: booking._id, status: booking.status },
      { $set: { status: nextStatus } },
      { new: true }
    );
    if (!updated) {
      throw new HttpException(409, "Booking was updated by someone else. Refresh and try again.");
    }

    if (nextStatus === "completed" && updated.escrowStatus === "held") {
      await walletService.release(
        updated.customerId.toString(),
        updated.professionalId.toString(),
        updated.amount,
        updated._id.toString()
      );
      updated.escrowStatus = "released";
      await updated.save();
    }

    if (nextStatus === "cancelled" && updated.escrowStatus === "held") {
      await walletService.refund(
        updated.customerId.toString(),
        updated.amount,
        updated._id.toString()
      );
      updated.escrowStatus = "refunded";
      await updated.save();
    }

    // Trigger realtime update
    broadcastRealtimeEvent("booking_updated", {
      id: updated._id.toString(),
      status: updated.status,
      escrowStatus: updated.escrowStatus,
      bookingId: updated._id.toString(),
    });

    // Trigger Notifications
    try {
      const service = await ServiceModel.findById(updated.serviceId);
      const serviceTitle = service?.title || "Service";

      if (nextStatus === "in_progress") {
        await createNotification(
          updated.customerId,
          "Technician on the way",
          `Work has started on your booking for "${serviceTitle}".`,
          "booking"
        );
      } else if (nextStatus === "completed") {
        await createNotification(
          updated.customerId,
          "Service completed",
          `Your service for "${serviceTitle}" has been marked complete. Rate your experience!`,
          "done"
        );
        if (updated.professionalId) {
          await createNotification(
            updated.professionalId,
            "Payment received",
            `Payment of Rs. ${updated.amount} for "${serviceTitle}" was released to your wallet.`,
            "payment"
          );
        }
      } else if (nextStatus === "cancelled") {
        await createNotification(
          updated.customerId,
          "Booking cancelled",
          `Your booking for "${serviceTitle}" was cancelled and Rs. ${updated.amount} was refunded.`,
          "done"
        );
        if (updated.professionalId) {
          await createNotification(
            updated.professionalId,
            "Booking cancelled",
            `Booking for "${serviceTitle}" has been cancelled by the customer.`,
            "done"
          );
        }
      }
    } catch (notifErr) {
      console.error("Failed to send booking status notification:", notifErr);
    }

    return updated;
  }

  private assertCanView(booking: IBooking, user: IUser) {
    const uid = user._id.toString();
    const isParty =
      booking.customerId.toString() === uid ||
      booking.professionalId.toString() === uid ||
      (booking.customerId as any)?._id?.toString() === uid ||
      (booking.professionalId as any)?._id?.toString() === uid;
    if (user.role !== "admin" && !isParty) {
      throw new HttpException(403, "Not allowed to view this booking");
    }
  }

  private assertCanAct(booking: IBooking, action: BookingAction, user: IUser) {
    const uid = user._id.toString();
    const isCustomer = booking.customerId.toString() === uid;
    const isPro = booking.professionalId.toString() === uid;

    if (user.role === "admin") return;

    if (action === "start" || action === "complete") {
      if (!isPro) {
        throw new HttpException(403, "Only the assigned professional can perform this action");
      }
      return;
    }

    if (action === "cancel") {
      if (!isCustomer && !isPro) {
        throw new HttpException(403, "Only booking parties can cancel");
      }
      return;
    }
  }
}

export const bookingService = new BookingService();
