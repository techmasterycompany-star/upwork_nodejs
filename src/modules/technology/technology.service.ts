import TechnologySchema from "../../models/technology.model.js";
import AppError from "../../error/AppError.js";

export const getAlltech = async () => {
  return TechnologySchema.find();
};

export const createTech = async (data: { name: string }) => {
  try {
    return await TechnologySchema.create(data);
  } catch (error: any) {
    if (error?.code === 11000)
      throw new AppError("Technology already exists", 409);
    throw error;
  }
};

export const updateTech = async (data: { name: string }, id: string) => {
  try {
    const technology = await TechnologySchema.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!technology) throw new AppError("Technology not found", 404);
    return technology;
  } catch (error: any) {
    if (error?.code === 11000)
      throw new AppError("Technology already exists", 409);
    throw error;
  }
};

export const deleteTech = async (id: string) => {
  const technology = await TechnologySchema.findByIdAndDelete(id);
  if (!technology) throw new AppError("Technology not found", 404);
  return technology;
};
