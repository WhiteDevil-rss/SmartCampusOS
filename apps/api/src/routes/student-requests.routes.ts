import { Router } from 'express';
import { getRequests, createServiceRequest, createComplaint, generateDocument } from '../controllers/student-requests.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['STUDENT']));

router.get('/', getRequests);
router.post('/service', createServiceRequest);
router.post('/complaint', createComplaint);
router.get('/document/:requestId', generateDocument);

export default router;
