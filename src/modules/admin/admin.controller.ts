import { Request, Response } from "express";
import * as adminService from "./admin.service.js";
import type { ListUsersQuery } from "./admin.validation.js";

// Job Approval

export const approveJob = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const job = await adminService.approvedJob(id);

  res.status(200).json({
    success: true,
    message: "Job approved successfully",
    data: job,
  });
};

export const rejectJob = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const job = await adminService.rejectedJob(id);

  res.status(200).json({
    success: true,
    message: "Job rejected successfully",
    data: job,
  });
};

// User Management

export const listUsers = async (
  req: Request,
  res: Response,
) => {
  const query = req.query as unknown as ListUsersQuery;

  const result = await adminService.listUsers(query);

  res.json({
    success: true,
    ...result,
  });
};

export const suspendUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = await adminService.suspendUser(req.params.id);

  res.json({
    success: true,
    data: user,
  });
};

export const activateUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = await adminService.activateUser(req.params.id);

  res.json({
    success: true,
    data: user,
  });
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  await adminService.softDeleteUser(req.params.id);

  res.status(204).end();
};