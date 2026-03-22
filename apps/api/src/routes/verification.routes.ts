import { Router } from 'express';
import { verifyStudentRegistration, verifyResultIntegrity } from '../controllers/verification.controller';

const router = Router();

// Endpoint for checking unauthenticated application statuses (Secure Hash needed)
router.get('/public/student', verifyStudentRegistration);

// Endpoint for auditing academic results via payload hash constraint
router.get('/public/result', verifyResultIntegrity);

export default router;
