import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
    getFeeStructures,
    createFeeStructure,
    processFeePayment,
    getStudentPayments
} from '../controllers/finance.controller';

const router = Router();

router.use(authenticate);

// Fee Structures
router.get('/structures', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getFeeStructures);
router.post('/structures', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), createFeeStructure);

// Fee Payments
router.post('/pay', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'STUDENT']), processFeePayment);
router.get('/student/:studentId', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'STUDENT']), getStudentPayments);

export default router;
