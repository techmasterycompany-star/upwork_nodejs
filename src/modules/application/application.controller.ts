import { Request, Response } from "express";
import AppError from "../../error/AppError.js";
import * as applicationService from "./application.service.js";

export const applyToJob = async (req: Request, res: Response) => {
  const candidateId = req.user?._id;
  if (!candidateId) throw new AppError("User not authenticated", 401);

  const application = await applicationService.applyToJob({
    jobId: req.params.jobId as string,
    candidateId,
    data: req.body,
    resumeFile: req.file,
  });

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: application,
  });
};

export const getMyApplications = async (req: Request, res: Response) => {
  const candidateId = req.user?._id;
  if (!candidateId) throw new AppError("User not authenticated", 401);

  const applications = await applicationService.getMyApplications(candidateId);
  res.status(200).json({ success: true, data: applications });
};

export const getApplicationsForJob = async (req: Request, res: Response) => {
  const employerId = req.user?._id;
  if (!employerId) throw new AppError("User not authenticated", 401);

  const applications = await applicationService.getApplicationsForJob(
    req.params.jobId as string,
    employerId,
  );
  res.status(200).json({ success: true, data: applications });
};

export const getApplicationById = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const role = req.user?.role;
  if (!userId || !role) throw new AppError("User not authenticated", 401);

  const application = await applicationService.getApplicationById({
    id: req.params.id as string,
    userId,
    role,
  });
  res.status(200).json({ success: true, data: application });
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  const employerId = req.user?._id;
  if (!employerId) throw new AppError("User not authenticated", 401);

  const application = await applicationService.updateApplicationStatus({
    id: req.params.id as string,
    employerId,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: `Application ${application.status}`,
    data: application,
  });
};

export const cancelApplication = async (req: Request, res: Response) => {
  const candidateId = req.user?._id;
  if (!candidateId) throw new AppError("User not authenticated", 401);

  const application = await applicationService.cancelApplication({
    id: req.params.id as string,
    candidateId,
  });

  res.status(200).json({
    success: true,
    message: "Application cancelled",
    data: application,
  });
};

export const generateCoverLetter = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new AppError("User not authenticated", 401);

  const coverLetter = await applicationService.generateCoverLetter({
    jobId: req.params.jobId as string,
    resumeText: req.body.resume_text,
  });
  res.status(200).json({
    success: true,
    data: { cover_letter: coverLetter },
  });
};
