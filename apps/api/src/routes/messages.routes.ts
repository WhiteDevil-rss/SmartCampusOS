import { Router } from 'express';
import { getThreads, getMessages, sendMessage, createThread } from '../controllers/messages.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['STUDENT', 'FACULTY', 'DEPT_ADMIN']));

router.get('/threads', getThreads);
router.get('/threads/:threadId/messages', getMessages);
router.post('/send', sendMessage);
router.post('/threads', createThread);

export default router;
