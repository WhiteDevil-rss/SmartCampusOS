import { Router } from 'express';
import { getPublicJobs, applyJob } from '../controllers/job.controller';

const router = Router();

// Publicly accessible endpoints (No auth required)
router.get('/', getPublicJobs);
router.post('/:jobId/apply', applyJob);

export default router;
