import { Router } from 'express';
import * as governanceController from '../controllers/governance.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Faculty Audits
router.post('/audit/faculty/:facultyId', authenticate, governanceController.triggerFacultyAudit);
router.get('/audit/faculty/:facultyId/history', authenticate, governanceController.getFacultyAudits);

// Curriculum Alignment
router.post('/audit/curriculum/:courseId', authenticate, governanceController.triggerCurriculumAudit);
router.get('/audit/curriculum/:courseId/history', authenticate, governanceController.getCourseAlignments);

export default router;
