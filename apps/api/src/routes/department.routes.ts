import { Router } from 'express';
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/department.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

// Universities and SUPERADMIN can manage departments
router.use(authenticate);
router.use(requireRole(['SUPERADMIN', 'UNI_ADMIN']));

// These routes assume they are mounted on /universities/:universityId/departments
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
