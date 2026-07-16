import type { Request, Response } from "express";
import { bookingService } from "../services/booking.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import type { CreateBookingDTO, UpdateBookingStatusDTO } from "../dtos/marketplace.dto.js";

export class BookingController {
  create = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const booking = await bookingService.createBooking(user, req.body as CreateBookingDTO);
    return ApiResponseHelper.success(res, booking, "Booking created successfully", 201);
  };

  listMine = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const bookings = await bookingService.getMyBookings(user);
    return ApiResponseHelper.success(res, bookings, "Bookings fetched successfully");
  };

  getOne = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const booking = await bookingService.getBookingById(req.params.id as string, user);
    return ApiResponseHelper.success(res, booking, "Booking fetched successfully");
  };

  updateStatus = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { action } = req.body as UpdateBookingStatusDTO;
    const booking = await bookingService.updateStatus(req.params.id as string, action, user);
    return ApiResponseHelper.success(res, booking, `Booking ${action}ed successfully`);
  };
}
