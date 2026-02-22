import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
    getUsers,
    createUser,
    updateUserStatus,
    resetUserPassword,
    updateUser,
    deleteUser
} from '../controllers/user.controller';

const router = Router();

// Only SUPERADMIN can manage all users directly
router.use(authenticate);
router.use(requireRole(['SUPERADMIN']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/password', resetUserPassword);

export default router;
