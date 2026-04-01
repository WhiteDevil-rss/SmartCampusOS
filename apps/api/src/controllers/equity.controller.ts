import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { blockchainService } from '../services/blockchain.service';

/**
 * Register a startup and its equity pool.
 */
export const registerStartup = async (req: AuthRequest, res: Response) => {
    try {
        const { startupId, founderAddress, totalEquity } = req.body;
        await blockchainService.registerStartup(startupId, founderAddress, totalEquity);
        res.status(201).json({ message: 'Startup registered with equity escrow' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register startup' });
    }
};
