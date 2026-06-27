import { Router } from 'express';
import { getProfile, updatePreferences, updateProfile } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', requireAuth, getProfile);
router.patch('/profile', requireAuth, updateProfile);
router.patch('/preferences', requireAuth, updatePreferences);

export default router;
