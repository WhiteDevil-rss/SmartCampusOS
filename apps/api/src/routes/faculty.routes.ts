import { Router } from 'express';
import { getFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty, getFacultyStats, getFacultySchedule, getFacultyPerformance } from '../controllers/faculty.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', requireRole(['FACULTY']), getFacultyStats);
router.get('/schedule', requireRole(['FACULTY']), getFacultySchedule);
router.get('/', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getFaculty);
router.get('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY']), getFacultyById);
router.post('/', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), createFaculty);
router.put('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY']), updateFaculty);
router.get('/performance/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getFacultyPerformance);
router.delete('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), deleteFaculty);

export default router;
