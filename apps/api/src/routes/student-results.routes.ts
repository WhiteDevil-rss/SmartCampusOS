import { Router } from 'express';
import { getAcademicResults } from '../controllers/student-results.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['STUDENT']));

router.get('/', getAcademicResults);

export default router;
