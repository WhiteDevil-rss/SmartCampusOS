import { Request, Response } from 'express';
import * as synergyService from '../services/synergy.service';

/**
 * GET /v2/synergy/matches
 */
export const getMySynergyMatches = async (req: Request, res: Response) => {
  try {
    const facultyId = (req as any).user?.id; // Assumes faculty ID is mapped from user session
    if (!facultyId) return res.status(401).json({ error: 'Unauthorized: Faculty identity required.' });

    const matches = await synergyService.getSynergyMatches(facultyId);
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /v2/synergy/propose
 */
export const proposeCollaboration = async (req: Request, res: Response) => {
  const { targetFacultyId } = req.body;
  const facultyId = (req as any).user?.id;

  if (!facultyId || !targetFacultyId) {
    return res.status(400).json({ error: 'Missing faculty identifiers.' });
  }

  try {
    const proposal = await synergyService.generateCollaborationProposal(facultyId, targetFacultyId);
    res.json(proposal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
