import { Request, Response } from 'express';
import { MaintenanceService } from '../services/maintenance.service';

const maintenanceService = new MaintenanceService();

export const getCampusHealth = async (req: Request, res: Response) => {
    try {
        const { universityId } = req.query;
        if (!universityId) return res.status(400).json({ error: 'University ID required' });
        
        const health = await maintenanceService.getCampusHealth(String(universityId));
        res.json(health);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllAssets = async (req: Request, res: Response) => {
    try {
        const { universityId } = req.query;
        if (!universityId) return res.status(400).json({ error: 'University ID required' });

        const assets = await maintenanceService.getAssets(String(universityId));
        res.json(assets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const resolveTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { resolution } = req.body;
        if (!resolution) return res.status(400).json({ error: 'Resolution details required' });

        const ticket = await maintenanceService.resolveMaintenance(id as string, resolution as string);
        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const simulateTelemetry = async (req: Request, res: Response) => {
    try {
        const { assetId } = req.params;
        const { dropAmount } = req.body;
        
        const updated = await maintenanceService.simulateTelemetry(assetId as string, Number(dropAmount) || 25);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
