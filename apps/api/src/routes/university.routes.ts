import { Router } from 'express';
import { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity } from '../controllers/university.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Only SUPERADMIN can manage universities
router.use(authenticate);
router.use(requireRole(['SUPERADMIN']));

router.get('/', getAllUniversities);
router.get('/:id', getUniversityById);
router.post('/', createUniversity);
router.put('/:id', updateUniversity);
router.delete('/:id', deleteUniversity);

export default router;
