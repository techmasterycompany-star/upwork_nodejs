import { Request, Response, NextFunction } from "express";
import * as searchService from "./search.service.js";
import AppError from "../../error/AppError.js";

export const searchJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await searchService.searchJobs(req.query, req.user?.id);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const saveSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    const { name, filters } = req.body;
    const saved = await searchService.saveSearch(userId, name, filters);
    res.status(201).json({
      success: true,
      message: "Search saved successfully",
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedSearches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    const searches = await searchService.getSavedSearches(userId);
    res.status(200).json({
      success: true,
      data: searches,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    const { id } = req.params;
    await searchService.deleteSavedSearch(userId, id);
    res.status(200).json({
      success: true,
      message: "Saved search deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const applySavedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    const { id } = req.params;
    const result = await searchService.applySavedSearch(userId, id);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};