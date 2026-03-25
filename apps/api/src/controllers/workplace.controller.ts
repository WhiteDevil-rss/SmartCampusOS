import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { blockchainService } from '../services/blockchain.service';

/**
 * Release a performance-based bonus to a faculty member.
 */
export const releaseBonus = async (req: AuthRequest, res: Response) => {
    try {
        const { facultyAddress, amount, reason } = req.body;
        await blockchainService.releaseSalaryBonus(facultyAddress, amount, reason);
        res.json({ message: 'Salary bonus released on-chain' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to release bonus' });
    }
};

/**
 * Escrow payment for a freelance job on campus.
 */
export const postJobEscrow = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId, amount } = req.body;
        // In reality, this would be an ethers call from the frontend
        res.json({ message: 'Job escrow should be handled via frontend wallet interaction' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to post job' });
    }
};
