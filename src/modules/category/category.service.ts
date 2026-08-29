import CategorySchema from "../../models/category.model.js";
import AppError from "../../error/AppError.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation.js";

export const getAllCategories = async () => {
  return CategorySchema.find();
};

export const createCategory = async (data: CreateCategoryInput) => {
  try {
    return await CategorySchema.create(data);
  } catch (error: any) {
    if (error?.code === 11000)
      throw new AppError("Category already exists", 409);
    throw error;
  }
};

export const updateCategory = async (data: UpdateCategoryInput, id: string) => {
  try {
    const updateData: { name?: string; description?: string } = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const category = await CategorySchema.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new AppError("Category not found", 404);
    return category;
  } catch (error: any) {
    if (error?.code === 11000)
      throw new AppError("Category already exists", 409);
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  const category = await CategorySchema.findByIdAndDelete(id);
  if (!category) throw new AppError("Category not found", 404);
  return category;
};
