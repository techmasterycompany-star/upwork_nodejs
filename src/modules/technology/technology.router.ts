import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createNewTechnologies,
  deleteTechnologie,
  readAllTechnologies,
  updateTechnologie,
} from "./technology.controller.js";
import {
  createTechnology,
  updateTechnology,
  technologyIdSchema,
} from "./technology.validation.js";

const technologiesRouter = Router();

technologiesRouter.get("/", authMiddleware, readAllTechnologies);

technologiesRouter.post(
  "/create",
  authMiddleware,
  authorize("admin"),
  validate(createTechnology),
  createNewTechnologies,
);

technologiesRouter.patch(
  "/update/:id",
  authMiddleware,
  authorize("admin"),
  validate(updateTechnology),
  updateTechnologie,
);

technologiesRouter.delete(
  "/delete/:id",
  authMiddleware,
  authorize("admin"),
  validate(technologyIdSchema),
  deleteTechnologie,
);

export default technologiesRouter;
