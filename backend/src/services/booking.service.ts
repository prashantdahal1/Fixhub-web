import { BookingModel, type BookingAction, type IBooking } from "../models/booking.model.js";
import { ServiceModel } from "../models/service.model.js";
import { HttpException } from "../exceptions/http-exception.js";
import { walletService } from "./wallet.service.js";
import { resolveNextStatus } from "./booking-state.js";
import type { CreateBookingDTO } from "../dtos/marketplace.dto.js";
import type { IUser } from "../models/user.model.js";

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

    // Create booking first (pending), then hold escrow; roll back on hold failure
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
        status: "pending",
        escrowStatus: "none",
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new HttpException(
          409,
          "This professional is already booked at that time. Choose another slot."
        );
      }
      throw err;
    }

    try {
      await walletService.hold(
        customer._id.toString(),
        service.basePrice,
        booking._id.toString()
      );
      booking.escrowStatus = "held";
      await booking.save();
    } catch (err) {
      await BookingModel.findByIdAndDelete(booking._id);
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

    if (action === "confirm" || action === "start" || action === "complete") {
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
