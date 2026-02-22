import { Router } from 'express';
import { getResources, getResourceById, createResource, updateResource, deleteResource } from '../controllers/resource.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
// Department Admins also need read access to resources for special TT
router.get('/', getResources);
router.get('/:id', getResourceById);

// Only Super Admin and Uni Admin can modify resources
router.post('/', requireRole(['SUPERADMIN', 'UNI_ADMIN']), createResource);
router.put('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN']), updateResource);
router.delete('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN']), deleteResource);

export default router;
