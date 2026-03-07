import { Router } from 'express';
import { getFeeDetails, processPayment, getReceipt } from '../controllers/studentFees.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['STUDENT']));

router.get('/', getFeeDetails);
router.post('/pay', processPayment);
router.get('/receipt/:paymentId', getReceipt);

export default router;
