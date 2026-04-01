import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();

// Inventory Items
router.get('/:universityId/items', InventoryController.getItems);
router.post('/:universityId/items', InventoryController.createItem);
router.put('/items/:itemId', InventoryController.updateItem);
router.post('/items/:itemId/adjust', InventoryController.adjustStock);

// Vendors
router.get('/:universityId/vendors', InventoryController.getVendors);
router.post('/:universityId/vendors', InventoryController.createVendor);

// Procurement
router.get('/:universityId/procurement', InventoryController.getProcurementRequests);
router.post('/:universityId/procurement', InventoryController.createProcurementRequest);
router.put('/procurement/:requestId/status', InventoryController.updateProcurementStatus);

// AI Forecasting
router.get('/:universityId/forecast', InventoryController.getForecast);

export default router;
