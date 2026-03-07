import { Router } from 'express';
import { getPermissions, updatePermission, getSubscriptionControls, updateSubscriptionControl } from '../controllers/permission.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@smartcampus-os/types';

const router = Router();

// Only Superadmins can manage these globally
router.use(authenticate);
router.use(requireRole([UserRole.SUPER_ADMIN]));

router.get('/permissions', getPermissions);
router.post('/permissions', updatePermission);

router.get('/subscriptions', getSubscriptionControls);
router.put('/subscriptions/:id', updateSubscriptionControl);

export default router;
