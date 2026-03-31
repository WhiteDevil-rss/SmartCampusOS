import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
    getFeeStructures,
    createFeeStructure,
    processFeePayment,
    getStudentPayments,
    getFinancialAudit,
    getEligibleGrants,
    applyForGrant
} from '../controllers/finance.controller';

const router = Router();

router.use(authenticate);

// Fee Structures
router.get('/structures', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getFeeStructures);
router.post('/structures', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), createFeeStructure);

// Fee Payments
router.get('/student/:studentId', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'STUDENT']), getStudentPayments);

// AI Auditor & Scholarships
router.get('/audit/:feeStructureId', requireRole(['STUDENT']), getFinancialAudit);
router.get('/grants/eligible', requireRole(['STUDENT']), getEligibleGrants);
router.post('/grants/apply', requireRole(['STUDENT']), applyForGrant);

export default router;
