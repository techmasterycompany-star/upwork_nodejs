import { Router } from "express";
import * as searchController from "./search.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { searchJobsSchema, saveSearchSchema } from "./search.validation.js";

const router = Router();


router.get("/jobs", validate(searchJobsSchema), searchController.searchJobs);


router.post("/save", authMiddleware, validate(saveSearchSchema), searchController.saveSearch);


router.get("/saved", authMiddleware, searchController.getSavedSearches);


router.get("/apply/:id", authMiddleware, searchController.applySavedSearch);


router.delete("/saved/:id", authMiddleware, searchController.deleteSavedSearch);

export default router;