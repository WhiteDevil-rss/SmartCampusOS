import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
    getComplaints,
    createComplaint,
    resolveComplaint
} from '../controllers/admin-request.controller';

const router = Router();

router.use(authenticate);

// Student Endpoints
router.post('/student', requireRole(['STUDENT']), createComplaint);

// Admin Endpoints
router.get('/admin', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getComplaints);
router.patch('/admin/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), resolveComplaint);

export default router;
