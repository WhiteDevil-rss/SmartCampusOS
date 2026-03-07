import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { generateStudyPlan } from '../controllers/career-planner.controller';

const router = Router();

router.use(authenticate);

// Student Only Routes
router.get('/plan', requireRole(['STUDENT']), generateStudyPlan);

export default router;
