import AppError from "../../error/AppError.js";
import Comment from "../../models/comment.model.js";
import User from "../../models/user.model.js";
import Job from "../../models/job.model.js";
import mongoose from "mongoose";

// create comment
export const createComment = async (
  jobId: string,
  userId: string,
  content: string,
) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.status !== "approved") {
    throw new AppError("Comments are only allowed on approved jobs", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.is_blocked || user.deletedAt) {
    throw new AppError("User is not active", 403);
  }

  const comment = await Comment.create({
    job_id: jobId,
    user_id: userId,
    content: content,
  });
  return comment;
};

// update the comment
export const updateComment = async (
  commentId: string,
  userId: string,
  content: string,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.deletedAt) {
    throw new AppError("Cannot edit a deleted comment", 422);
  }
  if (comment.user_id.toString() !== userId) {
    throw new AppError("You can only edit your own comments", 403);
  }

  comment.content = content;
  await comment.save();

  return comment;
};

// Delete comment
export const deleteComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.deletedAt) {
    throw new AppError("Cannot edit a deleted comment", 422);
  }
  if (comment.user_id.toString() !== userId) {
    throw new AppError("You can only delete your own comments", 403);
  }
  comment.deletedAt = new Date();
  await comment.save();

  return comment;
};

// report comment
export const reportComment = async (
  commentId: string,
  userId: string,
  reason?: string,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.deletedAt) {
    throw new AppError("Cannot report a deleted comment", 422);
  }
  const alreadyReported = comment.reports?.some(
    (report) => report.user_id.toString() === userId,
  );
  if (alreadyReported) {
    throw new AppError("You already reported this comment before", 422);
  }
  if (!comment.reports) {
    comment.reports = [];
  }
  comment.reports.push({
    user_id: new mongoose.Types.ObjectId(userId),
    reason: reason,
    created_at: new Date(),
  });
  await comment.save();
  return comment;
};

// admin list comment
export const adminListComments = async () => {
  const comments = await Comment.find();
  return comments;
};

// admin hide comment
export const adminHideComment = async (commentID: string) => {
  const comment = await Comment.findById(commentID);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.deletedAt) {
    throw new AppError("Cannot hide a deleted comment", 422);
  }
  comment.is_approved = false;
  await comment.save();
  return comment;
};

// admin unhide comment
export const adminUnhideComment = async (commentID: string) => {
  const comment = await Comment.findById(commentID);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.deletedAt) {
    throw new AppError("Cannot unhide a deleted comment", 422);
  }
  comment.is_approved = true;
  await comment.save();
  return comment;
};

// admin remove comment
export const adminRemoveComment = async (commentId: string) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.deletedAt) {
    throw new AppError("Comment is already deleted", 422);
  }
  comment.deletedAt = new Date();
  await comment.save();
  return comment;
};
