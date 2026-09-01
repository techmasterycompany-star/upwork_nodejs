import { Types } from "mongoose";
import AppError from "../../error/AppError.js";
import Application from "../../models/application.model.js";
import Job from "../../models/job.model.js";
import User from "../../models/user.model.js";
import type {
  ApplyJobInput,
  UpdateApplicationStatusInput,
} from "./application.validation.js";
import * as notificationService from "../notification/notification.service.js";

interface ApplyToJobInput {
  jobId: string;
  candidateId: Types.ObjectId;
  data: ApplyJobInput;
  resumeFile?: Express.Multer.File;
}

export const applyToJob = async ({
  jobId,
  candidateId,
  data,
  resumeFile,
}: ApplyToJobInput) => {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found", 404);
  if (job.status !== "approved")
    throw new AppError("This job is not open for applications", 400);
  if (job.application_deadline <= new Date())
    throw new AppError("The application deadline for this job has passed", 400);

  let resume: string | undefined;
  if (resumeFile) {
    const uploaded = await uploadBuffer(resumeFile.buffer, {
      folder: "job-board/resumes",
      resource_type: "raw",
    });
    resume = uploaded.url;
  }

  if (!resume) {
    const candidate = await User.findById(candidateId).select(
      "candidateProfile.resume",
    );
    resume = candidate?.candidateProfile?.resume;
  }

  if (!resume)
    throw new AppError(
      "No resume found. Upload one with this application or add one to your profile.",
      400,
    );

  let application;
  try {
    application = await Application.create({
      job_id: job._id,
      candidate_id: candidateId,
      resume,
      resume_text: data.resume_text,
      cover_letter: data.cover_letter,
      message: data.message,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
    });

    await Job.updateOne({ _id: job._id }, { $inc: { applications_count: 1 } });
  } catch (error: any) {
    if (error?.code === 11000)
      throw new AppError("You have already applied to this job", 409);
    throw error;
  }

  try {
    await notificationService.notify({
      userId: candidateId,
      type: "application_submitted",
      title: "Application submitted",
      content: `Your application for "${job.title}" has been submitted successfully.`,
    });
  } catch (error) {
    console.error("Failed to create submission notification:", error);
  }

  return application;
};

export const getMyApplications = async (candidateId: Types.ObjectId) => {
  return Application.find({ candidate_id: candidateId })
    .populate("job_id", "title work_type location status")
    .sort({ createdAt: -1 });
};

export const getApplicationsForJob = async (
  jobId: string,
  employerId: Types.ObjectId,
) => {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found", 404);
  if (!job.employer_id.equals(employerId)) throw new AppError("Forbidden", 403);

  return Application.find({ job_id: jobId })
    .sort({ createdAt: -1 })
    .populate("candidate_id", "name email candidateProfile");
};

export const getApplicationById = async ({
  id,
  userId,
  role,
}: {
  id: string;
  userId: Types.ObjectId;
  role: "candidate" | "employer" | "admin";
}) => {
  const application = await Application.findById(id).populate<{
    job_id: { _id: Types.ObjectId; employer_id: Types.ObjectId };
  }>("job_id", "employer_id title");

  if (!application) throw new AppError("Application not found", 404);

  if (role === "candidate") {
    if (!application.candidate_id.equals(userId))
      throw new AppError("Forbidden", 403);
  } else if (role === "employer") {
    if (!application.job_id.employer_id.equals(userId))
      throw new AppError("Forbidden", 403);

    if (application.status === "submitted") {
      application.status = "under_review";
      await application.save();
    }
  }

  return application;
};

export const updateApplicationStatus = async ({
  id,
  employerId,
  data,
}: {
  id: string;
  employerId: Types.ObjectId;
  data: UpdateApplicationStatusInput;
}) => {
  const application = await Application.findById(id).populate<{
    job_id: { _id: Types.ObjectId; employer_id: Types.ObjectId; title: string };
  }>("job_id", "employer_id title");

  if (!application) throw new AppError("Application not found", 404);
  if (!application.job_id.employer_id.equals(employerId))
    throw new AppError("Forbidden", 403);

  if (["accepted", "rejected", "cancelled"].includes(application.status))
    throw new AppError(`Application already ${application.status}`, 400);

  application.status = data.status;
  application.reviewed_at = new Date();
  if (data.status === "rejected")
    application.rejection_reason = data.rejection_reason;

  await application.save();

  try {
    await notificationService.notify({
      userId: application.candidate_id,
      type: "application_status_changed",
      title: `Application ${data.status}`,
      content:
        data.status === "accepted"
          ? `Great news! Your application for "${application.job_id.title}" was accepted.`
          : `Your application for "${application.job_id.title}" was rejected.${
              data.rejection_reason ? ` Reason: ${data.rejection_reason}` : ""
            }`,
    });
  } catch (error) {
    console.error("Failed to create status-change notification:", error);
  }

  return application;
};

export const cancelApplication = async ({
  id,
  candidateId,
}: {
  id: string;
  candidateId: Types.ObjectId;
}) => {
  const application = await Application.findById(id);
  if (!application) throw new AppError("Application not found", 404);
  if (!application.candidate_id.equals(candidateId))
    throw new AppError("Forbidden", 403);

  if (["accepted", "rejected", "cancelled"].includes(application.status))
    throw new AppError(
      `Cannot cancel an application that is already ${application.status}`,
      400,
    );

  application.status = "cancelled";
  await application.save();
  await Job.updateOne(
    { _id: application.job_id },
    { $inc: { applications_count: -1 } },
  );
  return application;
};

import { generateText } from "../../utils/ai.js";
import { uploadBuffer } from "../../utils/cloudinary.js";

interface GenerateCoverLetterInput {
  jobId: string;
  resumeText: string;
}

export const generateCoverLetter = async ({
  jobId,
  resumeText,
}: GenerateCoverLetterInput): Promise<string> => {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found", 404);
  if (job.status !== "approved")
    throw new AppError(
      "Cannot generate a cover letter for a job that is not open for applications",
      400,
    );

  const systemPrompt =
    "You are a professional career assistant that writes concise, personalized cover letters. " +
    "Write in a confident, professional tone. Do not invent facts, skills, or experience that " +
    "are not present in the candidate's resume. Keep the letter under 350 words. " +
    "Output only the cover letter text itself, with no preamble, explanation, or markdown formatting.";

  const userPrompt = `Job Title: ${job.title}

Job Description:
${job.description}

Candidate Resume:
${resumeText}

Write a tailored cover letter for this candidate applying to this job.`;

  return generateText(systemPrompt, userPrompt);
};
