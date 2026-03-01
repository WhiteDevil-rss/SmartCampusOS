import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Only Superadmins should be able to manage global settings
router.get('/', authenticate, getSettings);
router.patch('/', authenticate, updateSettings);

export default router;
