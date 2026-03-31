import { Router } from 'express';
import { getDivisions, createDivision, updateDivision, deleteDivision, enrollStudentsToDivision } from '../controllers/division.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']));

router.get('/', getDivisions);
router.post('/', createDivision);
router.put('/:id', updateDivision);
router.delete('/:id', deleteDivision);
router.post('/:id/enroll', enrollStudentsToDivision);

export default router;
