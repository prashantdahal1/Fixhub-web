import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps async route handlers so rejected promises go to the global error middleware.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
