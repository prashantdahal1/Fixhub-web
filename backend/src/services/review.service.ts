import mongoose from "mongoose";
import { ReviewModel, type IReview } from "../models/review.model.js";
import { BookingModel } from "../models/booking.model.js";
import { ServiceModel } from "../models/service.model.js";
import { UserModel, type IUser } from "../models/user.model.js";
import { HttpException } from "../exceptions/http-exception.js";
import type { CreateReviewDTO } from "../dtos/marketplace.dto.js";

export class ReviewService {
  async createReview(customer: IUser, data: CreateReviewDTO): Promise<IReview> {
    if (customer.role !== "customer" && customer.role !== "admin") {
      throw new HttpException(403, "Only customers can leave reviews");
    }

    const booking = await BookingModel.findById(data.bookingId);
    if (!booking) {
      throw new HttpException(404, "Booking not found");
    }
    if (booking.customerId.toString() !== customer._id.toString() && customer.role !== "admin") {
      throw new HttpException(403, "You can only review your own bookings");
    }
    if (booking.status !== "completed") {
      throw new HttpException(400, "You can only review completed bookings");
    }

    const existing = await ReviewModel.findOne({ bookingId: booking._id });
    if (existing) {
      throw new HttpException(400, "This booking has already been reviewed");
    }

    let review: IReview;
    try {
      review = await ReviewModel.create({
        bookingId: booking._id,
        serviceId: booking.serviceId,
        professionalId: booking.professionalId,
        customerId: customer._id,
        rating: data.rating,
        comment: data.comment || "",
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new HttpException(400, "This booking has already been reviewed");
      }
      throw err;
    }

    await this.recomputeAverages(booking.serviceId.toString(), booking.professionalId.toString());
    return review;
  }

  async getReviewsForService(serviceId: string): Promise<IReview[]> {
    return ReviewModel.find({ serviceId })
      .populate("customerId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 });
  }

  private async recomputeAverages(serviceId: string, professionalId: string) {
    const serviceOid = new mongoose.Types.ObjectId(serviceId);
    const professionalOid = new mongoose.Types.ObjectId(professionalId);

    const [serviceAgg] = await ReviewModel.aggregate([
      { $match: { serviceId: serviceOid } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (serviceAgg) {
      await ServiceModel.findByIdAndUpdate(serviceId, {
        rating: Math.round(serviceAgg.avg * 10) / 10,
        reviewCount: serviceAgg.count,
      });
    }

    const [proAgg] = await ReviewModel.aggregate([
      { $match: { professionalId: professionalOid } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (proAgg) {
      await UserModel.findByIdAndUpdate(professionalId, {
        averageRating: Math.round(proAgg.avg * 10) / 10,
        reviewCount: proAgg.count,
      });
    }
  }
}

export const reviewService = new ReviewService();
