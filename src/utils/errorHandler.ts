import { Request, Response, NextFunction } from "express";
import AppError from "../error/AppError.js";

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError)
    return res
      .status(err.status)
      .json({ success: false, message: err.message });

  console.error("Unexpected error:", err);
  try {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } catch (responseError) {
    console.error("Error sending error response:", responseError);
  }
}
