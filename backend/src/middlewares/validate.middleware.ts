import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { HttpException } from "../exceptions/http-exception.js";

type RequestPart = "body" | "query" | "params";

/**
 * Zod validation middleware. On success, replaces req[part] with parsed data.
 */
export function validate(schema: ZodSchema, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const message = result.error.errors
        .map((e) => `${e.path.join(".") || part}: ${e.message}`)
        .join(", ");
      return next(new HttpException(400, message));
    }
    (req as any)[part] = result.data;
    return next();
  };
}

export const validateBody = (schema: ZodSchema) => validate(schema, "body");
export const validateQuery = (schema: ZodSchema) => validate(schema, "query");
export const validateParams = (schema: ZodSchema) => validate(schema, "params");
