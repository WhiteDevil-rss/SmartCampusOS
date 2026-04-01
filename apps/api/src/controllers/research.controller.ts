import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as researchService from '../services/research.service';

export const getResearchNexus = async (req: AuthRequest, res: Response) => {
    try {
        const facultyId = req.user?.entityId;
        if (!facultyId || req.user?.role !== 'FACULTY') {
            return res.status(403).json({ error: 'Unauthorized: Faculty context required' });
        }

        const data = await researchService.getFacultyResearchNexus(facultyId);
        return res.json(data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const addPublication = async (req: AuthRequest, res: Response) => {
    try {
        const facultyId = req.user?.entityId;
        if (!facultyId || req.user?.role !== 'FACULTY') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const publication = await researchService.createPublication(facultyId, req.body);
        return res.status(201).json(publication);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const addGrant = async (req: AuthRequest, res: Response) => {
    try {
        const facultyId = req.user?.entityId;
        if (!facultyId || req.user?.role !== 'FACULTY') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const grant = await researchService.createGrant(facultyId, req.body);
        return res.status(201).json(grant);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const predictImpact = async (req: AuthRequest, res: Response) => {
    try {
        const { abstract } = req.body;
        if (!abstract) {
            return res.status(400).json({ error: 'Abstract is required' });
        }

        const analysis = await researchService.analyzeResearchImpact(abstract);
        return res.json(analysis);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const generateProposal = async (req: AuthRequest, res: Response) => {
    try {
        const { grantId } = req.params;
        if (!grantId) {
            return res.status(400).json({ error: 'Grant ID is required' });
        }

        const updatedGrant = await researchService.generateFullProposal(grantId as string);
        return res.json(updatedGrant);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateGrant = async (req: AuthRequest, res: Response) => {
    try {
        const { grantId } = req.params;
        const { status, reviewComments } = req.body;

        if (!grantId) {
            return res.status(400).json({ error: 'Grant ID is required' });
        }

        const updatedGrant = await researchService.updateGrantStatus(grantId as string, status, reviewComments);
        return res.json(updatedGrant);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const assignReviewers = async (req: AuthRequest, res: Response) => {
    try {
        const { grantId } = req.params;
        const { reviewerIds } = req.body;

        if (!grantId || !reviewerIds || !Array.isArray(reviewerIds)) {
            return res.status(400).json({ error: 'Grant ID and reviewer IDs array are required' });
        }

        const result = await researchService.assignReviewers(grantId as string, reviewerIds);
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const performReview = async (req: AuthRequest, res: Response) => {
    try {
        const facultyId = req.user?.entityId;
        const { reviewId } = req.params;

        if (!facultyId || !reviewId) {
            return res.status(403).json({ error: 'Unauthorized or missing review ID' });
        }

        const result = await researchService.submitReview(reviewId as string, facultyId, req.body);
        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getPendingReviews = async (req: AuthRequest, res: Response) => {
    try {
        const facultyId = req.user?.entityId;
        if (!facultyId || req.user?.role !== 'FACULTY') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const reviews = await researchService.getPendingReviews(facultyId);
        return res.json(reviews);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getGrantReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { grantId } = req.params;
        if (!grantId) {
            return res.status(400).json({ error: 'Grant ID is required' });
        }

        const reviews = await researchService.getGrantReviews(grantId as string);
        return res.json(reviews);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getGrantFinancials = async (req: AuthRequest, res: Response) => {
    try {
        const { grantId } = req.params;
        if (!grantId) {
            return res.status(400).json({ error: 'Grant ID is required' });
        }

        const financials = await researchService.getGrantFinancials(grantId as string);
        return res.json(financials);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const addExpenditure = async (req: AuthRequest, res: Response) => {
    try {
        const { grantId } = req.params;
        if (!grantId) {
            return res.status(400).json({ error: 'Grant ID is required' });
        }

        const expenditure = await researchService.logExpenditure(grantId as string, req.body);
        return res.status(201).json(expenditure);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const analyzeEthics = async (req: AuthRequest, res: Response) => {
    try {
        const { grantId } = req.params;
        if (!grantId) {
            return res.status(400).json({ error: 'Grant ID is required' });
        }

        const results = await researchService.analyzeEthicalRisk(grantId as string);
        return res.json(results);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
