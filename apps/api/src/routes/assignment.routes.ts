import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { getAssignments, createAssignment, submitAssignment, gradeSubmission, getSubmissions } from '../controllers/assignment.controller';

const router = Router();

router.use(authenticate);

router.get('/', getAssignments);
router.post('/', requireRole(['FACULTY']), createAssignment);
router.post('/submit', requireRole(['STUDENT']), submitAssignment);
router.post('/grade', requireRole(['FACULTY']), gradeSubmission);
router.get('/:assignmentId/submissions', requireRole(['FACULTY']), getSubmissions);

export default router;
