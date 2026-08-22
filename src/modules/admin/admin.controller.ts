import { Request, Response } from "express";
import { approvedJob, rejectedJob } from "./admin.service.js";

export const approveJob = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const job = await approvedJob(id);
  res.status(200).json({
    success: true,
    message: " Job approved successfully",
    data: job,
  });
};
export const rejectJob = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const job = await rejectedJob(id);
  res.status(200).json({
    success: true,
    message: " Job rejected successfully",
    data: job,
  });
};
