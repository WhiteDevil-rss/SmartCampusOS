import { Request, Response } from 'express';
import * as institutionalFinanceService from '../services/institutional-finance.service';
import * as resourceForecastingService from '../services/resource-forecasting.service';

/**
 * Institutional Controller — Phase 24
 * Endpoints for high-level university administration.
 */

export const getFinancialOverview = async (req: Request, res: Response) => {
    try {
        const universityId = req.params.universityId as string;
        const overview = await institutionalFinanceService.getInstitutionalFinancialOverview(universityId);
        res.status(200).json(overview);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const runResourceForecast = async (req: Request, res: Response) => {
    try {
        const universityId = req.params.universityId as string;
        const forecast = await resourceForecastingService.forecastResourceBottlenecks(universityId);
        res.status(200).json(forecast);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const triggerAudit = async (req: Request, res: Response) => {
    try {
        const { expenditureId } = req.body;
        const auditLog = await institutionalFinanceService.auditExpenditure(expenditureId);
        res.status(200).json(auditLog);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
