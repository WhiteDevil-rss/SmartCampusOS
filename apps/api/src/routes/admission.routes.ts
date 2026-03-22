import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
    submitApplication,
    getApplications,
    updateApplicationStatus,
    onboardStudent,
    getPublicUniversities,
    getPublicDepartments,
    getPublicPrograms
} from '../controllers/admission.controller';

const router = Router();

// Public Admission Route
router.post('/public/submit', submitApplication);
router.get('/public/universities', getPublicUniversities);
router.get('/public/departments', getPublicDepartments);
router.get('/public/programs', getPublicPrograms);

// Admin Admission Routes
router.use(authenticate);
router.get('/admin', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getApplications);
router.patch('/admin/:id/status', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), updateApplicationStatus);
router.post('/admin/:id/onboard', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), onboardStudent);

export default router;
