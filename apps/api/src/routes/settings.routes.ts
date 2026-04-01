import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@smartcampus-os/types';

const router = Router();

// Only Superadmins should be able to manage global settings
router.get('/', authenticate, requireRole([UserRole.SUPER_ADMIN]), getSettings);
router.patch('/', authenticate, requireRole([UserRole.SUPER_ADMIN]), updateSettings);

export default router;
