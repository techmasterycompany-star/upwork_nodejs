import Comment from "../../models/comment.model.js";
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
    throw new Error("Job not found");
  }

  if (job.status !== "approved") {
    throw new Error("Comments are only allowed on approved jobs");
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
    throw new Error("Comment not found");
  }
  if (comment.deletedAt) {
    throw new Error("Cannot edit a deleted comment");
  }
  if (comment.user_id.toString() !== userId) {
    throw new Error("You can only edit your own comments");
  }

  comment.content = content;
  await comment.save();

  return comment;
};

// Delete comment
export const deleteComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }
  if (comment.deletedAt) {
    throw new Error("Cannot edit a deleted comment");
  }
  if (comment.user_id.toString() !== userId) {
    throw new Error("You can only delete your own comments");
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
    throw new Error("Comment not found");
  }
  if (comment.deletedAt) {
    throw new Error("Cannot report a deleted comment");
  }
  const alreadyReported = comment.reports?.some(
    (report) => report.user_id.toString() === userId,
  );
  if (alreadyReported) {
    throw new Error("You already reported this comment before");
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
    throw new Error("Comment not found");
  }
  if (comment.deletedAt) {
    throw new Error("Cannot hide a deleted comment");
  }
  comment.is_approved = false;
  await comment.save();
  return comment;
};

// admin unhide comment
export const adminUnhideComment = async (commentID: string) => {
  const comment = await Comment.findById(commentID);
  if (!comment) {
    throw new Error("Comment not found");
  }
  if (comment.deletedAt) {
    throw new Error("Cannot unhide a deleted comment");
  }
  comment.is_approved = true;
  await comment.save();
  return comment;
};

// admin remove comment
export const adminRemoveComment = async (commentId: string) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }
  if (comment.deletedAt) {
    throw new Error("Comment is already deleted");
  }
  comment.deletedAt = new Date();
  await comment.save();
  return comment;
};
