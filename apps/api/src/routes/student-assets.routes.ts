import { Router } from 'express';
import { getLibraryAssets, getPlacementDetails } from '../controllers/student-assets.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['STUDENT']));

router.get('/library', getLibraryAssets);
router.get('/placement', getPlacementDetails);

export default router;
