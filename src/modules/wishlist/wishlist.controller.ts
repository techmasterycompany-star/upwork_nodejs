import { Request, Response, NextFunction } from "express";
import * as wishlistService from "./wishlist.service.js";
import AppError from "../../error/AppError.js";

export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    if (req.user?.role !== "candidate") {
      throw new AppError("Only candidates can use wishlist", 403);
    }

    const { job_id } = req.body;
    const wishlistItem = await wishlistService.addToWishlist(userId, job_id);

    res.status(201).json({
      success: true,
      message: "Job added to wishlist successfully",
      data: wishlistItem,
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    if (req.user?.role !== "candidate") {
      throw new AppError("Only candidates can view wishlist", 403);
    }

    const wishlist = await wishlistService.getWishlist(userId);

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    if (req.user?.role !== "candidate") {
      throw new AppError("Only candidates can modify wishlist", 403);
    }

    const { id } = req.params;
    await wishlistService.removeFromWishlist(userId, id as string);

    res.status(200).json({
      success: true,
      message: "Job removed from wishlist successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const removeByJobId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    if (req.user?.role !== "candidate") {
      throw new AppError("Only candidates can modify wishlist", 403);
    }

    const { jobId } = req.params;
    await wishlistService.removeByJobId(userId, jobId as string);

    res.status(200).json({
      success: true,
      message: "Job removed from wishlist successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const checkInWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    if (req.user?.role !== "candidate") {
      throw new AppError("Only candidates can check wishlist", 403);
    }

    const { jobId } = req.params;
    const exists = await wishlistService.isInWishlist(userId, jobId as string);

    res.status(200).json({
      success: true,
      data: { exists },
    });
  } catch (error) {
    next(error);
  }
};
