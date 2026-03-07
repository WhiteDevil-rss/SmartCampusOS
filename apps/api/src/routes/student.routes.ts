import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
    getStudentProfile,
    getStudentStats,
    createStudent,
    getStudentPerformance,
    getStudents,
    updateStudent,
    deleteStudent
} from '../controllers/student.controller';

const router = Router();

router.use(authenticate);

// Student Management
router.get('/', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getStudents);
router.post('/', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), createStudent);
router.put('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), updateStudent);
router.delete('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), deleteStudent);

// Student Profile / Stats
router.get('/stats', getStudentStats); // Get logged in student stats
router.get('/performance/:studentId', getStudentPerformance);
router.get('/:studentId', getStudentProfile);

export default router;
