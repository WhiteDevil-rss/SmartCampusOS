import { Router } from 'express';
import * as MarksController from '../controllers/marks.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@smartcampus-os/types';

const router = Router();

// Dashboard / Data Fetching
router.get('/faculty/subjects', authenticate, requireRole([UserRole.FACULTY]), MarksController.getFacultySubjects);
router.get('/course/:courseId/students', authenticate, MarksController.getSubjectStudentsMarks);
router.get('/dept/pending', authenticate, requireRole([UserRole.DEPARTMENT_ADMIN]), MarksController.getPendingDeptReview);
router.get('/approval/pending', authenticate, requireRole([UserRole.APPROVAL_ADMIN]), MarksController.getPendingApprovalReview);

// Internal Marks Workflow
router.post('/faculty/upload', authenticate, requireRole([UserRole.FACULTY, UserRole.DEPARTMENT_ADMIN]), MarksController.uploadInternalMarks);
router.post('/faculty/submit', authenticate, requireRole([UserRole.FACULTY]), MarksController.submitToDept);
router.post('/dept/approve', authenticate, requireRole([UserRole.DEPARTMENT_ADMIN]), MarksController.approveByDept);
router.post('/approval/approve', authenticate, requireRole([UserRole.APPROVAL_ADMIN]), MarksController.approveByApprovalDept);

// University / External / Results
router.post('/university/external', authenticate, requireRole([UserRole.UNIVERSITY_ADMIN]), MarksController.uploadExternalMarks);
router.post('/university/publish', authenticate, requireRole([UserRole.UNIVERSITY_ADMIN]), MarksController.publishResults);

// Complaints & Reassessment
router.post('/student/complaint', authenticate, requireRole([UserRole.STUDENT]), MarksController.raiseComplaint);
router.post('/university/resolve-complaint', authenticate, requireRole([UserRole.UNIVERSITY_ADMIN]), MarksController.resolveComplaint);
router.post('/student/reassessment', authenticate, requireRole([UserRole.STUDENT]), MarksController.applyForReassessment);

export default router;
