import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
    getPayrollConfigs,
    upsertPayrollConfig,
    generateSalarySlips,
    getSalarySlips
} from '../controllers/finance.controller';

const router = Router();

router.use(authenticate);

// Payroll Configuration (Salary Structure)
router.get('/configs', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getPayrollConfigs);
router.post('/configs', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), upsertPayrollConfig);

// Salary Slipping & Processing
router.get('/slips', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY']), getSalarySlips);
router.post('/generate', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), generateSalarySlips);

export default router;
