import { Router } from 'express';
import { verifyResultPublicly } from '../controllers/result.controller';

const router = Router();

// Public verification route
router.get('/public/verify/:enrollmentNo', verifyResultPublicly);

export default router;
