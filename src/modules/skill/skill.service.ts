import Skill from "../../models/skill.model.js";
import AppError from "../../error/AppError.js";

export const getAllSkills = async () => {
  return Skill.find();
};

export const createSkill = async (data: { name: string }) => {
  try {
    return await Skill.create(data);
  } catch (error: any) {
    if (error?.code === 11000) throw new AppError("Skill already exists", 409);
    throw error;
  }
};

export const updateSkill = async (id: string, data: { name: string }) => {
  try {
    const skill = await Skill.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!skill) throw new AppError("Skill not found", 404);
    return skill;
  } catch (error: any) {
    if (error?.code === 11000) throw new AppError("Skill already exists", 409);
    throw error;
  }
};

export const deleteSkill = async (id: string) => {
  const skill = await Skill.findByIdAndDelete(id);
  if (!skill) throw new AppError("Skill not found", 404);
  return skill;
};
