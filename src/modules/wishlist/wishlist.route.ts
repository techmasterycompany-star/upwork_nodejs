import { Router } from "express";
import * as wishlistController from "./wishlist.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { addToWishlistSchema, wishlistIdSchema } from "./wishlist.validation.js";

const router = Router();


router.use(authMiddleware);


router.post("/", validate(addToWishlistSchema), wishlistController.addToWishlist);

router.get("/", wishlistController.getWishlist);


router.delete("/:id", validate(wishlistIdSchema), wishlistController.removeFromWishlist);


router.delete("/job/:jobId", wishlistController.removeByJobId);


router.get("/check/:jobId", wishlistController.checkInWishlist);

export default router;