import { Router } from 'express';
import { getClasses, createClass, updateClass, deleteClass } from '../controllers/class.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY', 'STUDENT']));

router.get('/', getClasses);
router.post('/', requireRole(['DEPT_ADMIN']), createClass);
router.put('/:id', requireRole(['DEPT_ADMIN']), updateClass);
router.delete('/:id', requireRole(['DEPT_ADMIN']), deleteClass);

export default router;
