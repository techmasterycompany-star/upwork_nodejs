import { Request, Response } from "express";
import * as commentService from "./comment.service.js";

// create
export const createComment = async (req: Request, res: Response) => {
  const jobId = req.params.jobId as string;
  const userId = req.user?._id?.toString();
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  const { content } = req.body;

  const comment = await commentService.createComment(jobId, userId, content);

  res.status(201).json({
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
};

// update
export const updateComment = async (req: Request, res: Response) => {
  const commentId = req.params.id as string;
  const userId = req.user?._id?.toString();
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  const { content } = req.body;
  const comment = await commentService.updateComment(
    commentId,
    userId,
    content,
  );
  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    data: comment,
  });
};

// delete
export const deleteComment = async (req: Request, res: Response) => {
  const commentId = req.params.id as string;
  const userId = req.user?._id?.toString();
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  await commentService.deleteComment(commentId, userId);
  res.status(204).end();
};

// reportComment
export const reportComment = async (req: Request, res: Response) => {
  const commentId = req.params.id as string;
  const userId = req.user?._id?.toString();
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  const { reason } = req.body;
  const comment = await commentService.reportComment(commentId, userId, reason);
  res.status(200).json({
    success: true,
    message: "Comment reported successfully",
    data: comment,
  });
};

// admin
// admin list comment
export const adminListComments = async (req: Request, res: Response) => {
  const comments = await commentService.adminListComments();

  res.status(200).json({
    success: true,
    data: comments,
  });
};

//admin hide comment:
export const adminHideComment = async (req: Request, res: Response) => {
  const commentId = req.params.id as string;
  const comments = await commentService.adminHideComment(commentId);

  res.status(200).json({
    success: true,
    message: "Comment hidden successfully",
    data: comments,
  });
};

//admin Unhide comment:
export const adminUnhideComment = async (req: Request, res: Response) => {
  const commentId = req.params.id as string;
  const comments = await commentService.adminUnhideComment(commentId);

  res.status(200).json({
    success: true,
    message: "Comment unhidden successfully",
    data: comments,
  });
};

//admin remove
export const adminRemoveComment = async (req: Request, res: Response) => {
  const commentId = req.params.id as string;
  await commentService.adminRemoveComment(commentId);
  res.status(204).end();
};
