import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { 
    getRecommendedAlumni, 
    searchAlumni, 
    requestConnection, 
    updateConnectionStatus,
    getPlacementAnalytics
} from '../controllers/alumni.controller';

const router = Router();

router.use(authenticate);

// Student routes
router.get('/recommendations', requireRole(['STUDENT']), getRecommendedAlumni);
router.get('/search', authenticate, searchAlumni); // All logged in users can search
router.post('/connect', authenticate, requestConnection);
router.patch('/connect/status', authenticate, updateConnectionStatus);

// Admin routes
router.get('/analytics/:universityId', requireRole(['UNI_ADMIN', 'SUPERADMIN']), getPlacementAnalytics);

export default router;
