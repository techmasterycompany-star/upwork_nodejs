import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  readAllCategories,
  createNewCategory,
  updateCategoryById,
  deleteCategoryById,
} from "./category.controller.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from "./category.validation.js";

const categoryRouter = Router();

categoryRouter.get("/", authMiddleware, readAllCategories);

categoryRouter.post(
  "/create",
  authMiddleware,
  authorize("admin"),
  validate(createCategorySchema),
  createNewCategory,
);

categoryRouter.patch(
  "/update/:id",
  authMiddleware,
  authorize("admin"),
  validate(updateCategorySchema),
  updateCategoryById,
);

categoryRouter.delete(
  "/delete/:id",
  authMiddleware,
  authorize("admin"),
  validate(categoryIdSchema),
  deleteCategoryById,
);

export default categoryRouter;