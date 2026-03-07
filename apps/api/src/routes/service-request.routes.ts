import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
    getServiceRequests,
    createServiceRequest,
    updateServiceRequest
} from '../controllers/admin-request.controller';

const router = Router();

router.use(authenticate);

// Student Endpoints
router.post('/student', requireRole(['STUDENT']), createServiceRequest);

// Admin Endpoints
router.get('/admin', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getServiceRequests);
router.patch('/admin/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), updateServiceRequest);

export default router;
