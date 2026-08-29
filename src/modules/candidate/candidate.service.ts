import User from '../../models/user.model.js';
import Skill from '../../models/skill.model.js';
import AppError from '../../error/AppError.js';

export const getCandidateProfile = async (userId: string) => {
  const user = await User.findById(userId)
    .select('name email role candidateProfile')
    .populate('candidateProfile.skills.skill_id')
    .lean();

  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'candidate') throw new AppError('Not a candidate', 403);
  if (!user.candidateProfile) throw new AppError('Candidate profile not found', 404);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...user.candidateProfile,
  };
};

export const updateCandidateProfile = async (
  userId: string,
  data: {
    headline?: string | null;
    bio?: string | null;
    location?: string | null;
    portfolio_url?: string | null;
    experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
  }
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'candidate') throw new AppError('Not a candidate', 403);

  const profile = user.candidateProfile ?? {
    headline: '',
    bio: '',
    location: '',
    portfolio_url: '',
    resume: '',
    skills: [],
    experience_level: 'entry' as const,
  };

  user.candidateProfile = profile;

  if (data.headline !== undefined && data.headline !== null) profile.headline = data.headline;
  if (data.bio !== undefined && data.bio !== null) profile.bio = data.bio;
  if (data.location !== undefined && data.location !== null) profile.location = data.location;
  if (data.portfolio_url !== undefined && data.portfolio_url !== null) profile.portfolio_url = data.portfolio_url;
  if (data.experience_level !== undefined) profile.experience_level = data.experience_level;

  await user.save();
  return profile;
};

export const updateSkills = async (userId: string, skillsData: { name: string; years_of_experience: number }[]) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'candidate') throw new AppError('Not a candidate', 403);


  const skillIds = await Promise.all(
    skillsData.map(async (skill) => {
      let existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${skill.name}$`, 'i') } });
      if (!existingSkill) {
        existingSkill = await Skill.create({ name: skill.name });
      }
      return {
        skill_id: existingSkill._id,
        years_of_experience: skill.years_of_experience,
      };
    })
  );


  const profile = user.candidateProfile ?? {
    headline: '',
    bio: '',
    location: '',
    portfolio_url: '',
    resume: '',
    skills: [],
    experience_level: 'entry' as const,
  };

  user.candidateProfile = profile;
  user.candidateProfile.skills = skillIds;

  await user.save();

  const updatedUser = await User.findById(userId)
    .populate('candidateProfile.skills.skill_id')
    .lean();

  return updatedUser?.candidateProfile?.skills || [];
};