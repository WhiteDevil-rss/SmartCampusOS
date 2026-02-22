import { Router } from 'express';
import { generateTimetable, getLatestTimetable, listTimetables, getTimetableById } from '../controllers/timetable.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Faculty can view the timetable, but only DEPT_ADMIN can generate it.
router.get('/', requireRole(['DEPT_ADMIN', 'FACULTY', 'SUPERADMIN', 'UNI_ADMIN']), listTimetables);
router.get('/latest', requireRole(['DEPT_ADMIN', 'FACULTY', 'SUPERADMIN', 'UNI_ADMIN']), getLatestTimetable);
router.get('/:id', requireRole(['DEPT_ADMIN', 'FACULTY', 'SUPERADMIN', 'UNI_ADMIN']), getTimetableById);
router.post('/generate', requireRole(['DEPT_ADMIN']), generateTimetable);

export default router;
