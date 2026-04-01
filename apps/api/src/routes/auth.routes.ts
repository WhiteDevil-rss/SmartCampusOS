import { Router } from 'express';
import {
  changePassword,
  getMe,
  login,
  logout,
  refreshSession,
  register,
  getSessionSettings,
  updateSessionSettings,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/security.middleware';

const router = Router();

router.post('/login', authRateLimiter, login);
router.post('/register', register);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/refresh', authenticate, authRateLimiter, refreshSession);
router.post('/change-password', authenticate, authRateLimiter, changePassword);
router.get('/settings/session', authenticate, getSessionSettings);
router.patch('/settings/session', authenticate, authRateLimiter, updateSessionSettings);

export default router;
