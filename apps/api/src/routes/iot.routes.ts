import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { recordSmartAttendance, getDeviceLogs } from '../controllers/iot.controller';

const router = Router();

// 1. Hardware M2M Webhook Endpoint (No JWT required, secured by payload secret)
router.post('/attendance', recordSmartAttendance);

// 2. Admin API Endpoints (Secured by JWT)
router.use(authenticate);
router.get('/logs', requireRole(['DEPT_ADMIN', 'UNI_ADMIN']), getDeviceLogs);

export default router;
