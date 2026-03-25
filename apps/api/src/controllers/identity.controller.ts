import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { blockchainService } from '../services/blockchain.service';

/**
 * Verify KYC for a user.
 */
export const verifyKYC = async (req: AuthRequest, res: Response) => {
    try {
        const { userAddress, userId, kycHash } = req.body;
        await blockchainService.verifyKYC(userAddress, userId, kycHash);
        res.json({ message: 'KYC verified on-chain' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify KYC' });
    }
};
