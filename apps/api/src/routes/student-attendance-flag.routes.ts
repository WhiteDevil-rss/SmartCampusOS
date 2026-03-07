import { Router } from 'express';
import { submitFlagRequest, getMyFlags, getAllFlagsForAdmin, updateFlagStatus } from '../controllers/student-attendance-flag.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['STUDENT']));

router.post('/', submitFlagRequest);
router.get('/', getMyFlags);

// Admin Routes
router.get('/admin', requireRole(['DEPT_ADMIN', 'UNI_ADMIN']), getAllFlagsForAdmin);
router.patch('/admin/:id', requireRole(['DEPT_ADMIN', 'UNI_ADMIN']), updateFlagStatus);


export default router;
