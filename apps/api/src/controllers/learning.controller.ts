import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { blockchainService } from '../services/blockchain.service';

/**
 * Purchase a learning module.
 */
export const purchaseLearningModule = async (req: AuthRequest, res: Response) => {
    try {
        const { moduleId, amount } = req.body;
        await blockchainService.purchaseLearningModule(moduleId, amount);
        res.json({ message: 'Module access purchased on-chain' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to purchase module' });
    }
};
