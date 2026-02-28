import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
    getUsers,
    createUser,
    updateUserStatus,
    resetUserPassword,
    updateUser,
    deleteUser,
    getProfile
} from '../controllers/user.controller';

const router = Router();

// Only SUPERADMIN can manage all users directly
router.use(authenticate);
router.get('/me', getProfile);
router.put('/profile', (req, res) => {
    (req.params as any).id = (req as any).user.id;
    return updateUser(req, res);
});

// Admin management routes
router.get('/', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), getUsers);
router.post('/', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), createUser);
router.put('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), updateUser);
router.delete('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), deleteUser);
router.patch('/:id/status', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), updateUserStatus);
router.patch('/:id/password', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), resetUserPassword);

export default router;
