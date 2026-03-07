import { Router } from 'express';
import {
    createInquiry,
    getAllInquiries,
    getInquiryById,
    updateInquiryStatus,
    deleteInquiry,
    exportInquiriesExcel,
} from '../controllers/inquiry.controller';
import { authenticate, requireRole, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

// ── Public route (no auth required) ─────────────────────────────────────────
router.post('/', createInquiry);

// ── Super Admin & Authorized Admin routes ────────────────────────────────────
router.use(authenticate);

router.get('/export', requirePermission('INQUIRIES', 'READ'), exportInquiriesExcel);
router.get('/', requirePermission('INQUIRIES', 'READ'), getAllInquiries);
router.get('/:id', requirePermission('INQUIRIES', 'READ'), getInquiryById);
router.patch('/:id/status', requirePermission('INQUIRIES', 'WRITE'), updateInquiryStatus);
router.delete('/:id', requirePermission('INQUIRIES', 'DELETE'), deleteInquiry);

export default router;
