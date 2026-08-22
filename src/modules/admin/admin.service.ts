import User from "../../models/user.model.js";
import AppError from "../../error/AppError.js";
import { accessSync } from "node:fs";
import jobModel from "../../models/job.model.js";

export const approvedJob = async (id: string) => {
  const job = await jobModel.findOneAndUpdate(
    { _id: id },
    { $set: { status: "approved" } },
    { new: true },
  );
};
export const rejectedJob = async (id: string) => {
  const job = await jobModel.findOneAndUpdate(
    { _id: id },
    { $set: { status: "rejected" } },
    { new: true },
  );
};
