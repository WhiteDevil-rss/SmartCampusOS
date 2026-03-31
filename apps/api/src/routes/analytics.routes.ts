import { Router } from 'express';
import { 
    getDepartmentAnalytics, 
    getStudentAtRisk, 
    getResultTrends, 
    getResourceForecast,
    getStudentSentinel,
    updateIntervention,
    getClassInsights,
    getDepartmentRiskMap,
    triggerBulkIntervention,
    simulatePolicy
} from '../controllers/analytics.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

router.get('/department', requireRole(['DEPT_ADMIN', 'SUPERADMIN']), getDepartmentAnalytics);
router.get('/sentinel', requireRole(['STUDENT']), getStudentSentinel);
router.get('/faculty/class-insights/:courseId', requireRole(['FACULTY', 'DEPT_ADMIN']), getClassInsights);
router.post('/faculty/simulate-policy', requireRole(['FACULTY', 'DEPT_ADMIN']), simulatePolicy);
router.get('/admin/department-risk-map/:departmentId?', requireRole(['DEPT_ADMIN', 'UNI_ADMIN']), getDepartmentRiskMap);
router.get('/:departmentId/risk', requireRole(['DEPT_ADMIN', 'UNI_ADMIN', 'FACULTY']), getStudentAtRisk);
router.get('/:departmentId/trends', requireRole(['DEPT_ADMIN', 'UNI_ADMIN']), getResultTrends);
router.get('/:departmentId/forecast', requireRole(['DEPT_ADMIN', 'UNI_ADMIN']), getResourceForecast);
router.patch('/intervention/:interventionId', requireRole(['STUDENT', 'FACULTY', 'DEPT_ADMIN']), updateIntervention);
router.post('/faculty/bulk-intervention', requireRole(['FACULTY', 'DEPT_ADMIN']), triggerBulkIntervention);

export default router;
