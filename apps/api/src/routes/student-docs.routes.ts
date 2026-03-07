import { Router } from 'express';
import { getVerifiedDocs, verifyDocument } from '../controllers/student-docs.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Public verification endpoint
router.get('/verify/:hash', verifyDocument);

// Protected student routes
router.use(authenticate);
router.use(requireRole(['STUDENT']));

router.get('/vault', getVerifiedDocs);

export default router;
