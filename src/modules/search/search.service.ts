import Job from "../../models/job.model.js";
import SavedSearch from "../../models/savedSearch.model.js";
import AppError from "../../error/AppError.js";
import { SearchJobsQuery } from "./search.validation.js";

export const searchJobs = async (query: SearchJobsQuery, userId?: string) => {
  const {
    q,
    location,
    category_id,
    work_type,
    salary_min,
    salary_max,
    experience_level,
    date_posted,
    sort_by,
    order,
    page,
    limit,
  } = query;

  const filter: any = { status: "approved" };

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  if (location) filter.location = { $regex: location, $options: "i" };
  if (category_id) filter.category_id = category_id;
  if (work_type) filter.work_type = work_type;
  if (experience_level) filter.experience_level = experience_level;

  // ✅ التصحيح هنا
  if (salary_min !== undefined || salary_max !== undefined) {
    filter.salary_min = {};
    filter.salary_max = {};
    if (salary_min !== undefined) filter.salary_min.$gte = salary_min;
    if (salary_max !== undefined) filter.salary_max.$lte = salary_max;
  }

  if (date_posted) {
    const date = new Date();
    date.setDate(date.getDate() - date_posted);
    filter.createdAt = { $gte: date };
  }

  const sort: any = {};
  sort[sort_by] = order === "asc" ? 1 : -1;

  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate("employer_id", "name email employerProfile")
      .populate("category_id", "name")
      .populate("technologies", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  return {
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const saveSearch = async (userId: string, name: string, filters: Record<string, any>) => {
  const savedSearch = await SavedSearch.create({
    user_id: userId,
    name,
    filters,
  });
  return savedSearch;
};

export const getSavedSearches = async (userId: string) => {
  return await SavedSearch.find({ user_id: userId }).sort({ createdAt: -1 }).lean();
};

export const deleteSavedSearch = async (userId: string, searchId: string) => {
  const result = await SavedSearch.findOneAndDelete({ _id: searchId, user_id: userId });
  if (!result) throw new AppError("Saved search not found", 404);
  return result;
};

export const applySavedSearch = async (userId: string, searchId: string) => {
  const saved = await SavedSearch.findOne({ _id: searchId, user_id: userId });
  if (!saved) throw new AppError("Saved search not found", 404);
  return await searchJobs(saved.filters, userId);
};