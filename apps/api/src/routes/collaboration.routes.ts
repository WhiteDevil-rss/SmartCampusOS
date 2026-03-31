import { Router } from 'express';
import * as collaborationController from '../controllers/collaboration.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

// --- Mentorship ---
router.post('/mentor/profile', requireRole(['STUDENT']), collaborationController.toggleMentorProfile);
router.get('/mentor/suggested', requireRole(['STUDENT']), collaborationController.getSuggestedMentors);
router.post('/mentor/request', requireRole(['STUDENT']), collaborationController.requestMentorship);

// --- Study Groups ---
router.post('/groups', requireRole(['STUDENT']), collaborationController.createStudyGroup);
router.get('/groups/available', requireRole(['STUDENT']), collaborationController.getAvailableGroups);
router.post('/groups/:groupId/join', requireRole(['STUDENT']), collaborationController.joinGroup);

// --- Resources ---
router.post('/resources', requireRole(['STUDENT']), collaborationController.uploadResource);

export default router;
