export const rollPeriodForward = (
  start: Date,
  end: Date,
  billingCycle: "monthly" | "yearly",
): { current_period_start: Date; current_period_end: Date } => {
  let newStart = new Date(start);
  let newEnd = new Date(end);
  const now = new Date();

  if (newEnd > now)
    return { current_period_start: newStart, current_period_end: newEnd };

  const intervalMs =
    billingCycle === "yearly"
      ? 365 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;

  while (newEnd <= now) {
    newStart = new Date(newEnd);
    newEnd = new Date(newEnd.getTime() + intervalMs);
  }

  return { current_period_start: newStart, current_period_end: newEnd };
};
