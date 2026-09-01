import { Request, Response, NextFunction } from "express";
import * as candidateService from "./candidate.service.js";
import AppError from "../../error/AppError.js";
import { uploadBuffer } from "../../utils/cloudinary.js";

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    const profile = await candidateService.getCandidateProfile(userId);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    const { headline, bio, location, portfolio_url, experience_level } =
      req.body;

    const updatedProfile = await candidateService.updateCandidateProfile(
      userId,
      {
        headline,
        bio,
        location,
        portfolio_url,
        experience_level,
      },
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSkills = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    const { skills } = req.body;

    const updatedSkills = await candidateService.updateSkills(userId, skills);

    res.status(200).json({
      success: true,
      message: "Skills updated successfully",
      data: updatedSkills,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadResume = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    if (!req.file) throw new AppError("No resume file uploaded", 400);

    const { url } = await uploadBuffer(req.file.buffer, {
      folder: "job-board/resumes",
      resource_type: "raw",
    });

    const updatedProfile = await candidateService.updateCandidateResume(
      userId,
      url,
    );

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};
