import { Router } from 'express';
import { generateNaacReport } from '../controllers/accreditation.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint for Quality Assurance Cell to fetch live NAAC metrics
router.get('/naac', authenticate, requireRole(['SUPERADMIN', 'UNI_ADMIN']), generateNaacReport);

export default router;
