import { Router } from 'express';
import {
    getNotifications,
    markAsRead,
    updateFcmToken,
    deleteNotification,
    broadcastNotification
} from '../controllers/notification.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.post('/read', markAsRead);
router.post('/token', updateFcmToken);
router.post('/broadcast', requirePermission('NOTIFICATIONS', 'WRITE'), broadcastNotification);
router.delete('/:id', deleteNotification);

export default router;
