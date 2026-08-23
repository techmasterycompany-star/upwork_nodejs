import { Request, Response } from "express";
import * as adminService from "./adminService.js";
import type { ListUsersQuery } from "./admin.validation.js";

type ValidatedRequest<T> = Request & {
  validated: {
    query: T;
  };
};

const listUsers = async (
  req: ValidatedRequest<ListUsersQuery>,
  res: Response,
) => {
  const result = await adminService.listUsers(req.validated.query);

  res.json({ success: true, ...result });
};

const suspendUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = await adminService.suspendUser(req.params.id);

  res.json({ success: true, data: user });
};

const activateUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const user = await adminService.activateUser(req.params.id);

  res.json({ success: true, data: user });
};

const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  await adminService.softDeleteUser(req.params.id);

  res.status(204).end();
};

export { listUsers, suspendUser, activateUser, deleteUser };