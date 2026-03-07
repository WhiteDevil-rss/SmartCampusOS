import { Router } from 'express';
import { getDepartmentAnalytics, getStudentAtRisk, getResultTrends } from '../controllers/analytics.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

router.get('/department', requireRole(['DEPT_ADMIN', 'SUPERADMIN']), getDepartmentAnalytics);
router.get('/:departmentId/risk', requireRole(['DEPT_ADMIN', 'UNI_ADMIN']), getStudentAtRisk);
router.get('/:departmentId/trends', requireRole(['DEPT_ADMIN', 'UNI_ADMIN']), getResultTrends);

export default router;
