import type { Request, Response, NextFunction } from "express";
import { aiMatchingService } from "./ai-matching.service.js";
import type { MatchingRequest } from "./ai-matching.service.js";
import { ApiResponseHelper } from "../../shared/utils/apihelper.util.js";

export const findBestMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceCategory, customerLocation, maxResults } = req.body;
    
    console.log("AI Matching Request Body:", { serviceCategory, customerLocation, maxResults });
    
    // Temporarily use a dummy customer ID since auth is bypassed
    const customerId = (req as any).user?._id || "67a27f620261c0bcd53762463"; // Dummy customer ID

    if (!serviceCategory) {
      return ApiResponseHelper.error(res, "Service category is required", 400);
    }

    const matchingRequest: MatchingRequest = {
      customerId,
      serviceCategory,
      customerLocation,
      maxResults: maxResults || 5,
    };

    console.log("AI Matching Request:", matchingRequest);

    const matches = await aiMatchingService.findBestMatches(matchingRequest);

    console.log("AI Matching Results:", matches);

    return ApiResponseHelper.success(
      res,
      { matches, count: matches.length },
      "AI matching completed successfully"
    );
  } catch (error: any) {
    console.error("AI Matching Controller Error:", error);
    console.error("Error stack:", error.stack);
    return ApiResponseHelper.error(
      res,
      error.message || "Failed to find matches",
      500
    );
  }
};

export const getProfessionalAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { professionalId } = req.params;
    const currentUserId = (req as any).user?._id;

    if (!professionalId) {
      return ApiResponseHelper.error(res, "Professional ID is required", 400);
    }

    // Handle array case from params
    const professionalIdStr = Array.isArray(professionalId) ? professionalId[0] : professionalId;

    if (!professionalIdStr) {
      return ApiResponseHelper.error(res, "Invalid professional ID", 400);
    }

    // Only allow professionals to view their own analytics or admins to view any
    const isAdmin = (req as any).user?.role === 'admin';
    const isOwnProfile = currentUserId === professionalIdStr;

    if (!isAdmin && !isOwnProfile) {
      return ApiResponseHelper.error(res, "Unauthorized to view these analytics", 403);
    }

    const analytics = await aiMatchingService.getProfessionalAnalytics(professionalIdStr as string);

    return ApiResponseHelper.success(
      res,
      analytics,
      "Professional analytics retrieved successfully"
    );
  } catch (error: any) {
    console.error("Analytics Controller Error:", error);
    return ApiResponseHelper.error(
      res,
      error.message || "Failed to get analytics",
      500
    );
  }
};
