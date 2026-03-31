import { Router } from 'express';
import { transferStudent, bulkTransferStudents, getTransferHistory } from '../controllers/student-transfer.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']));

router.post('/', transferStudent);
router.post('/bulk', bulkTransferStudents);
router.get('/history', getTransferHistory);

export default router;
