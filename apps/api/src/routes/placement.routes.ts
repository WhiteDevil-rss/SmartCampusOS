import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { getCompanies, addCompany, getPlacementRecords, recordPlacement } from '../controllers/placement.controller';

const router = Router();

router.use(authenticate);

// UNI_ADMIN and DEPT_ADMIN routes for managing placements
router.get('/companies', requireRole(['UNI_ADMIN', 'DEPT_ADMIN', 'SUPERADMIN']), getCompanies);
router.post('/companies', requireRole(['UNI_ADMIN', 'DEPT_ADMIN', 'SUPERADMIN']), addCompany);
router.get('/records', requireRole(['UNI_ADMIN', 'DEPT_ADMIN', 'SUPERADMIN']), getPlacementRecords);
router.post('/records', requireRole(['UNI_ADMIN', 'DEPT_ADMIN', 'SUPERADMIN']), recordPlacement);

export default router;
