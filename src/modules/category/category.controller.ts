import { Request, Response } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "./category.service.js";
import type { UpdateCategoryInput } from "./category.validation.js";

export const readAllCategories = async (req: Request, res: Response) => {
  const categories = await getAllCategories();
  res.status(200).json({
    success: true,
    data: categories,
  });
};

export const createNewCategory = async (req: Request, res: Response) => {
  const category = await createCategory(req.body);
  res.status(200).json({
    success: true,
    message: "Category added successfully",
    data: category,
  });
};

export const updateCategoryById = async (req: Request, res: Response) => {
  const categoryId = req.params.id as string;
  const category = await updateCategory(
    req.body as UpdateCategoryInput,
    categoryId,
  );
  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
};

export const deleteCategoryById = async (req: Request, res: Response) => {
  const categoryId = req.params.id as string;
  const category = await deleteCategory(categoryId);
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: category,
  });
};
