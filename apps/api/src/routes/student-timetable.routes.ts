import { Router } from 'express';
import {
    getStudentTimetable,
    getTodayTimetable,
    getTimetableChanges,
    submitElectiveSelection
} from '../controllers/student-timetable.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Secure all student timetable routes
router.use(authenticate);
router.use(requireRole(['STUDENT']));

router.get('/', getStudentTimetable);
router.get('/today', getTodayTimetable);
router.get('/changes', getTimetableChanges);
router.post('/elective-selection', submitElectiveSelection);

export default router;
