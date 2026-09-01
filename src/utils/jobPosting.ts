import Job from "../models/job.model.js";
import AppError from "../error/AppError.js";
import { getOrUpdateActiveSubscription } from "../modules/subscription/subscription.utils.js";

export const checkJobPostingQuota = async (
  employerId: string,
): Promise<void> => {
  const subscription = await getOrUpdateActiveSubscription(employerId);
  const plan = subscription.plan_id as any;

  if (plan.job_post_limit === null) return;

  const jobsCount = await Job.countDocuments({
    employer_id: employerId,
    createdAt: {
      $gte: subscription.current_period_start,
      $lte: subscription.current_period_end,
    },
  });

  if (jobsCount >= plan.job_post_limit)
    throw new AppError(
      `Job posting quota exceeded for plan "${plan.name}". Quota: ${plan.job_post_limit}`,
      400,
    );
};
