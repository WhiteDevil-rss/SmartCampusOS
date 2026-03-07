import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { getStudentAttendance, createAttendanceSession, markAttendance, bulkMarkAttendance, getStudentsForSlot } from '../controllers/attendance.controller';

const router = Router();

router.use(authenticate);

// Retrieve student attendance
router.get('/:studentId', getStudentAttendance);

// Create new attendance session (Faculty/Admin only)
router.post('/session', requireRole(['FACULTY', 'DEPT_ADMIN']), createAttendanceSession);

// Mark student attendance (Faculty/Admin only or automated systems)
router.post('/mark', requireRole(['FACULTY', 'DEPT_ADMIN']), markAttendance);
router.post('/bulk-mark', requireRole(['FACULTY', 'DEPT_ADMIN']), bulkMarkAttendance);
router.get('/students/:slotId', requireRole(['FACULTY', 'DEPT_ADMIN']), getStudentsForSlot);

export default router;
