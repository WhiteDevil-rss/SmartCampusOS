import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
    static async getItems(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const items = await InventoryService.getItems(universityId);
            res.json(items);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createItem(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const item = await InventoryService.createItem(universityId, req.body);
            res.status(201).json(item);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateItem(req: Request, res: Response) {
        try {
            const itemId = req.params.itemId as string;
            const item = await InventoryService.updateItem(itemId, req.body);
            res.json(item);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async adjustStock(req: Request, res: Response) {
        try {
            const itemId = req.params.itemId as string;
            const { userId } = (req as any).user;
            const { quantity, type, reason } = req.body;
            const item = await InventoryService.adjustStock(itemId, quantity, type, reason, userId);
            res.json(item);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getVendors(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const vendors = await InventoryService.getVendors(universityId);
            res.json(vendors);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createVendor(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const vendor = await InventoryService.createVendor(universityId, req.body);
            res.status(201).json(vendor);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getProcurementRequests(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const requests = await InventoryService.getProcurementRequests(universityId);
            res.json(requests);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createProcurementRequest(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const { userId } = (req as any).user;
            const request = await InventoryService.createProcurementRequest(universityId, userId, req.body);
            res.status(201).json(request);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateProcurementStatus(req: Request, res: Response) {
        try {
            const requestId = req.params.requestId as string;
            const { status } = req.body;
            const { userId } = (req as any).user;
            const request = await InventoryService.updateProcurementStatus(requestId, status, userId);
            res.json(request);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getForecast(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const forecast = await InventoryService.getForecast(universityId);
            res.json(forecast);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
