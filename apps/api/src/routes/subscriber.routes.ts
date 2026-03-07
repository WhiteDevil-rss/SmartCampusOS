import { Router } from 'express';
import {
    subscribe,
    getSubscribers,
    getSubscribersStats,
    updateSubscriberStatus,
    deleteSubscriber,
    exportSubscribers
} from '../controllers/subscriber.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint: Newsletter signup
router.post('/', subscribe);

// Protected endpoints
router.get('/', authenticate, requirePermission('SUBSCRIBERS', 'READ'), getSubscribers);
router.get('/stats', authenticate, requirePermission('SUBSCRIBERS', 'READ'), getSubscribersStats);
router.patch('/:id/status', authenticate, requirePermission('SUBSCRIBERS', 'UPDATE'), updateSubscriberStatus);
router.delete('/:id', authenticate, requirePermission('SUBSCRIBERS', 'DELETE'), deleteSubscriber);
router.get('/export', authenticate, requirePermission('SUBSCRIBERS', 'READ'), exportSubscribers);

export default router;
