import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { blockchainService } from '../services/blockchain.service';

/**
 * Fund an event's vendor escrow.
 */
export const fundEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId, vendorAddress, amount } = req.body;
        await blockchainService.fundEvent(eventId, vendorAddress, amount);
        res.json({ message: 'Event funded on-chain' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fund event' });
    }
};

/**
 * Register a lost item reward.
 */
export const registerLostItemReward = async (req: AuthRequest, res: Response) => {
    try {
        const { itemId } = req.body;
        // Should be handled by student wallet on frontend
        res.json({ message: 'Lost item reward registration logic is on-chain' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register reward' });
    }
};
