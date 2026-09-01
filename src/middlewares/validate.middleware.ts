import { z, ZodType } from "zod";
import { Request, Response, NextFunction } from "express";
import AppError from "../error/AppError.js";

export const validate = (schema: ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      });
      if (result.body) req.body = result.body;
      if (result.params) req.params = result.params;
      if (result.query) {
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, result.query);
      }
      if (result.cookies) {
        Object.keys(req.cookies).forEach((key) => delete req.cookies[key]);
        Object.assign(req.cookies, result.cookies);
      }
            (req as any).validated = result;

      next();
    } catch (error: any) {
      const message =
        error.issues
          ?.map((c: any) => `${c.path.join(":")} : ${c.message}`)
          .join(",") ||
        error.message ||
        "Validation error";
      next(new AppError(message, 422));
    }
  };
};
