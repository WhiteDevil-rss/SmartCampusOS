import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { blockchainService } from '../services/blockchain.service';
import prisma from '../lib/prisma';

/**
 * Create a new poll for institutional voting.
 */
export const createPoll = async (req: AuthRequest, res: Response) => {
    try {
        const { pollId, question, duration } = req.body;
        // 1. Record on Blockchain
        await blockchainService.createPoll(pollId, question, duration);
        res.status(201).json({ message: 'Poll created on-chain', pollId });
    } catch (error) {
        console.error('Governance: Create Poll Failed:', error);
        res.status(500).json({ error: 'Failed to create poll' });
    }
};

/**
 * Cast a vote in a poll.
 */
export const castVote = async (req: AuthRequest, res: Response) => {
    try {
        const { pollId, optionIndex } = req.body;
        await blockchainService.castVote(pollId, optionIndex);
        res.json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error('Governance: Vote Failed:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
};

/**
 * Register Intellectual Property (Patent/Research).
 */
export const registerIP = async (req: AuthRequest, res: Response) => {
    try {
        const { patentId, ipHash } = req.body;
        // In a real app, we'd store the patent details in Prisma too
        // For now, we trust the blockchain record
        res.json({ message: 'IP Registration logic should be called via frontend or separate service' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register IP' });
    }
};
