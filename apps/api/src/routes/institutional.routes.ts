import { Router } from 'express';
import * as institutionalController from '../controllers/institutional.controller';

const router = Router();

/**
 * Institutional Routes — Phase 24
 * Routes for high-level university financial and resource management.
 */

// Global financial overview of all departments for a specific university
router.get('/overview/:universityId', institutionalController.getFinancialOverview);

// Run AI resource forecasting for a specific university
router.get('/forecast/:universityId', institutionalController.runResourceForecast);

// Manually trigger or re-run an AI audit on a specific research expenditure
router.post('/audit', institutionalController.triggerAudit);

export default router;
