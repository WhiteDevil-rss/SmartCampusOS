import { Router } from 'express';
import { getFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty } from '../controllers/faculty.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getFaculty);
router.get('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY']), getFacultyById);
router.post('/', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), createFaculty);
router.put('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY']), updateFaculty);
router.delete('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), deleteFaculty);

export default router;
