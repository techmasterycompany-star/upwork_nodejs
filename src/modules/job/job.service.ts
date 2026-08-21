import AppError from "../../error/AppError.js";
import jobModel from "../../models/job.model.js";
import { Types } from "mongoose";

export const createJob = async (jobData: any, userId: Types.ObjectId) => {
  const newJob = {
    ...jobData,
    employer_id: userId,
    status: "pending_approval",
  };

  const job = await jobModel.create(newJob);
  return job;
};

export const getAllJobs = async () => {
  const Jobs = await jobModel.find({ status: "approved" });
  return Jobs;
};

export const getAllAdminJobs = async () => {
  const Jobs = await jobModel.find({ status: "pending_approval" });
  return Jobs;
};

export const getemployeeJobs = async (id: Types.ObjectId) => {
  const Jobs = await jobModel.find({ employer_id: id });
  return Jobs;
};

export const updateJob = async (
  id: string,
  userId: Types.ObjectId,
  jobData: any,
) => {
  const job = await jobModel.findOneAndUpdate(
    {
      _id: id,
      employer_id: userId,
    },
    jobData,
    { new: true },
  );

  if (!job) {
    throw new AppError("Job not found", 404);
  }
  return job;
};

export const deleteJobbyid = async (id: string, userId: Types.ObjectId) => {
  const job = await jobModel.findOneAndDelete({
    _id: id,
    employer_id: userId,
  });

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};
