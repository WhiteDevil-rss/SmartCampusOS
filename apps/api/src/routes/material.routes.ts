import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { getMaterials, createMaterial, deleteMaterial } from '../controllers/material.controller';

const router = Router();

router.use(authenticate);

router.get('/', getMaterials);
router.post('/', requireRole(['FACULTY']), createMaterial);
router.delete('/:id', requireRole(['FACULTY']), deleteMaterial);

export default router;
