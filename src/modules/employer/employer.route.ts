import { Router } from 'express';
import { getProfile, updateProfile, uploadLogo } from './employer.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateEmployerProfileSchema } from './employer.validation.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', validate(updateEmployerProfileSchema), updateProfile);
router.post('/logo', upload.single('logo'), uploadLogo);

export default router;