import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { askQuestion, getChatHistory } from '../controllers/chatbot.controller';

const router = Router();

router.use(authenticate);

// Student Only AI Assistant Routes
router.post('/ask', requireRole(['STUDENT']), askQuestion);
router.get('/history', requireRole(['STUDENT']), getChatHistory);

export default router;
