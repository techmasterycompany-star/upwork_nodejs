import User from "../../models/user.model.js";
import AppError from "../../error/AppError.js";
import type { ListUsersQuery } from "./admin.validation.js";
import jobModel from "../../models/job.model.js";

export const approvedJob = async (id: string) => {
  const job = await jobModel.findOneAndUpdate(
    { _id: id },
    { $set: { status: "approved" } },
    { new: true },
  );

  if (!job) {
    throw new AppError("Not Found", 404);
  }

  return job;
};

export const rejectedJob = async (id: string) => {
  const job = await jobModel.findOneAndUpdate(
    { _id: id },
    { $set: { status: "rejected" } },
    { new: true },
  );

  if (!job) {
    throw new AppError("Not Found", 404);
  }

  return job;
};

const listUsers = async (filters: ListUsersQuery) => {
  const { role, is_blocked, search, page, limit } = filters;

  const query: Record<string, any> = { deletedAt: null };

  if (role) query.role = role;

  if (is_blocked !== undefined) {
    query.is_blocked = is_blocked;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const findActiveUserOrThrow = async (id: string) => {
  const user = await User.findOne({
    _id: id,
    deletedAt: null,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const suspendUser = async (id: string) => {
  const user = await findActiveUserOrThrow(id);

  if (user.role === "admin") {
    throw new AppError("Cannot suspend an admin account", 403);
  }

  user.is_blocked = true;

  await user.save();

  return user;
};

const activateUser = async (id: string) => {
  const user = await findActiveUserOrThrow(id);

  user.is_blocked = false;

  await user.save();

  return user;
};

const softDeleteUser = async (id: string) => {
  const user = await findActiveUserOrThrow(id);

  if (user.role === "admin") {
    throw new AppError("Cannot delete an admin account", 403);
  }

  user.deletedAt = new Date();

  await user.save();

  return true;
};

export { listUsers, suspendUser, activateUser, softDeleteUser };
