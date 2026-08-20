import User from "../../models/user.model.js";
import AppError from "../../error/AppError.js";

export const getEmployerProfile = async (userId: string) => {
  const user = await User.findById(userId)
    .select("name email role employerProfile")
    .lean();

  if (!user) throw new AppError("User not found", 404);
  if (user.role !== "employer") throw new AppError("Not an employer", 403);
  if (!user.employerProfile)
    throw new AppError("Employer profile not found", 404);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...user.employerProfile,
  };
};

export const updateEmployerProfile = async (
  userId: string,
  data: {
    companyName: string;
    description: string;
    industry: string;
    website?: string | null;
  },
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  if (user.role !== "employer") throw new AppError("Not an employer", 403);

  const profile =
    user.employerProfile ??
    (user.employerProfile = {
      company_name: "",
      company_logo: "",
      description: "",
      industry: "",
      website: "",
    } as any);

  if (data.companyName !== undefined) profile.company_name = data.companyName;
  if (data.description !== undefined) profile.description = data.description;
  if (data.industry !== undefined) profile.industry = data.industry;
  if (data.website !== undefined) profile.website = data.website;

  await user.save();
  return user.employerProfile;
};

export const updateEmployerLogo = async (userId: string, logoPath: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  if (user.role !== "employer") throw new AppError("Not an employer", 403);

  const profile =
    user.employerProfile ??
    (user.employerProfile = {
      company_name: "",
      company_logo: "",
      description: "",
      industry: "",
      website: "",
    } as any);

  profile.company_logo = logoPath;
  await user.save();
  return user.employerProfile;
};
