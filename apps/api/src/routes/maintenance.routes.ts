import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.controller';

const router = Router();

router.get('/health', maintenanceController.getCampusHealth);
router.get('/assets', maintenanceController.getAllAssets);
router.patch('/tickets/:id/resolve', maintenanceController.resolveTicket);
router.post('/simulate/:assetId', maintenanceController.simulateTelemetry);

export default router;
