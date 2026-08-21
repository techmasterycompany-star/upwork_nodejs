import AppError from "../../error/AppError.js";
import {
  createJob,
  deleteJobbyid,
  getAllJobs,
  getemployeeJobs,
  updateJob,
} from "./job.service.js";
import { Request, Response } from "express";

export const createNewJob = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new AppError("User not authenticated", 401);
  const job = await createJob(req.body, userId);
  res.status(200).json({
    success: true,
    message: "Job created successfully",
    data: job,
  });
};

export const readAllJobs = async (req: Request, res: Response) => {
  const job = await getAllJobs();
  res.status(200).json({
    success: true,
    message: "get Jobs successfully",
    data: job,
  });
};

export const reademployeeJobs = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new AppError("User not authenticated", 401);
  const job = await getemployeeJobs(userId);
  res.status(200).json({
    success: true,
    message: "get Jobs successfully",
    data: job,
  });
};

export const updateJobs = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user?._id;
  if (!userId) throw new AppError("User not authenticated", 401);
  if (!id) throw new AppError("job id not found", 401);
  const job = await updateJob(id, userId, req.body);
  res.status(200).json({
    success: true,
    message: "job updated successfully",
    data: job,
  });
};
export const deleteJob = async (req: Request, res: Response) => {

  const id = req.params.id as string;
  const userId = req.user?._id;
  
  if (!userId) throw new AppError("User not authenticated", 401);
  if (!id) throw new AppError("job id not found", 401);
  const job = await deleteJobbyid(id, userId);
  res.status(200).json({
    success: true,
    message: "job Deleted successfully",
    data: job,
  });
};
