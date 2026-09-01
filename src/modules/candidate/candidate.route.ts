import { Router } from 'express';
import { getProfile, updateProfile, updateSkills } from './candidate.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateCandidateProfileSchema, updateSkillsSchema } from './candidate.validation.js';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', validate(updateCandidateProfileSchema), updateProfile);
router.put('/skills', validate(updateSkillsSchema), updateSkills);

export default router;