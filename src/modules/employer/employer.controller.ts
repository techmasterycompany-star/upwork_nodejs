import { Request, Response, NextFunction } from 'express';
import * as employerService from './employer.service.js';
import AppError from '../../error/AppError.js';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('User not authenticated', 401);

    const profile = await employerService.getEmployerProfile(userId);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { companyName, description, industry, website } = req.body;

    const updatedProfile = await employerService.updateEmployerProfile(userId, {
      companyName,
      description,
      industry,
      website,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('User not authenticated', 401);

    if (!req.file) {
      throw new AppError('No logo file uploaded', 400);
    }

    const filePath = `/uploads/${req.file.filename}`;
    const updatedProfile = await employerService.updateEmployerLogo(userId, filePath);

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoUrl: filePath,
        profile: updatedProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};