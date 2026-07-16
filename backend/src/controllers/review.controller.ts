import type { Request, Response } from "express";
import { reviewService } from "../services/review.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import type { CreateReviewDTO } from "../dtos/marketplace.dto.js";

export class ReviewController {
  create = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const review = await reviewService.createReview(user, req.body as CreateReviewDTO);
    return ApiResponseHelper.success(res, review, "Review submitted successfully", 201);
  };

  listForService = async (req: Request, res: Response) => {
    const reviews = await reviewService.getReviewsForService(req.params.serviceId as string);
    return ApiResponseHelper.success(res, reviews, "Reviews fetched successfully");
  };
}
