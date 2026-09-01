import Wishlist from "../../models/wishlist.model.js";
import Job from "../../models/job.model.js";
import AppError from "../../error/AppError.js";


export const addToWishlist = async (candidateId: string, jobId: string) => {

  const job = await Job.findOne({ _id: jobId, status: "approved" });
  if (!job) throw new AppError("Job not found or not approved", 404);


  const existing = await Wishlist.findOne({
    candidate_id: candidateId,
    job_id: jobId,
  });
  if (existing) throw new AppError("Job already in wishlist", 409);

  const wishlistItem = await Wishlist.create({
    candidate_id: candidateId,
    job_id: jobId,
  });

  return wishlistItem;
};


export const getWishlist = async (candidateId: string) => {
  const wishlist = await Wishlist.find({ candidate_id: candidateId })
    .populate({
      path: "job_id",
      select: "title description location work_type salary_min salary_max experience_level createdAt",
      populate: [
        { path: "employer_id", select: "name email employerProfile" },
        { path: "category_id", select: "name" },
        { path: "technologies", select: "name" },
      ],
    })
    .sort({ createdAt: -1 })
    .lean();

  return wishlist;
};


export const removeFromWishlist = async (candidateId: string, wishlistId: string) => {
  const result = await Wishlist.findOneAndDelete({
    _id: wishlistId,
    candidate_id: candidateId,
  });
  if (!result) throw new AppError("Wishlist item not found", 404);
  return result;
};


export const removeByJobId = async (candidateId: string, jobId: string) => {
  const result = await Wishlist.findOneAndDelete({
    candidate_id: candidateId,
    job_id: jobId,
  });
  if (!result) throw new AppError("Wishlist item not found", 404);
  return result;
};


export const isInWishlist = async (candidateId: string, jobId: string) => {
  const exists = await Wishlist.findOne({
    candidate_id: candidateId,
    job_id: jobId,
  });
  return !!exists;
};