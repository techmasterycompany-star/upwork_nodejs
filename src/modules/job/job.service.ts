import AppError from "../../error/AppError.js";
import jobModel from "../../models/job.model.js";
import { IUser } from "../../models/user.model.js";
import categoryModel from "../../models/category.model.js";
import technologyModel from "../../models/technology.model.js";
import { HydratedDocument, Types } from "mongoose";
import { checkJobPostingQuota } from "../../utils/jobPosting.js";
import { generateText } from "../../utils/ai.js";
import type { CreateJobInput, UpdateJobInput } from "./Job.Validation.js";
import JobView from "../../models/jobView.model.js";

const assertCategoryExists = async (categoryId: string) => {
  const category = await categoryModel.findById(categoryId);
  if (!category) throw new AppError("Invalid category", 400);
};

const assertTechnologiesExist = async (technologyIds: string[]) => {
  const count = await technologyModel.countDocuments({
    _id: { $in: technologyIds },
  });
  if (count !== technologyIds.length)
    throw new AppError("One or more technologies are invalid", 400);
};

export const createJob = async (
  jobData: CreateJobInput,
  userId: Types.ObjectId,
) => {
  await checkJobPostingQuota(userId.toString());

  await assertCategoryExists(jobData.category_id);

  if (jobData.technologies?.length) {
    await assertTechnologiesExist(jobData.technologies);
  }

  const newJob = {
    ...jobData,
    employer_id: userId,
    status: "pending_approval" as "pending_approval",
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
  const Jobs = await jobModel.find({ employer_id: id, status: "approved" });
  return Jobs;
};

export const readJobById = async (
  id: string,
  user: HydratedDocument<IUser>,
) => {
  let job;

  if (user.role === "candidate") {
    try {
      await JobView.create({ job_id: id, candidate_id: user._id });
      job = await jobModel.findOneAndUpdate(
        { _id: id, status: "approved" },
        { $inc: { views_count: 1 } },
        { new: true },
      );
    } catch (error: any) {
      if (error?.code === 11000) {
        job = await jobModel.findOne({ _id: id, status: "approved" });
      } else {
        throw error;
      }
    }
  } else if (user.role === "employer") {
    job = await jobModel.findOne({
      _id: id,
      employer_id: user._id,
    });
  } else if (user.role === "admin") {
    job = await jobModel.findById(id);
  }

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

export const updateJob = async (
  id: string,
  userId: Types.ObjectId,
  jobData: UpdateJobInput,
) => {
  if (jobData.category_id) {
    await assertCategoryExists(jobData.category_id);
  }

  if (jobData.technologies?.length) {
    await assertTechnologiesExist(jobData.technologies);
  }

  const job = await jobModel.findOneAndUpdate(
    {
      _id: id,
      employer_id: userId,
    },
    jobData,
    { new: true, runValidators: true },
  );

  if (!job) {
    throw new AppError("Job not found", 404);
  }
  return job;
};

export const closeJob = async (id: string, userId: Types.ObjectId) => {
  const job = await jobModel.findOneAndUpdate(
    {
      _id: id,
      employer_id: userId,
      status: "approved",
    },
    { $set: { status: "closed" } },
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

export const generateJobDescriptionService = async (
  title: string,
  experienceLevel: string,
) => {
  const systemPrompt = `
You are a job description assistant.

Generate a professional job description based on the job title
and experience level.

Return exactly these three sections:
Description:
Responsibilities:
Requirements:
`;

  const input = `
Job Title: ${title}
Experience Level: ${experienceLevel}
`;

  const result = await generateText(systemPrompt, input);

  return result;
};
