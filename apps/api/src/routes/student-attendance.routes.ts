import { Router } from 'express';
import { getDashboard } from '../controllers/student-attendance.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['STUDENT']));

router.get('/dashboard', getDashboard);

export default router;
