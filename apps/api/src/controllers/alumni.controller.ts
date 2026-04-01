import { Request, Response } from 'express';
import { AlumniService } from '../services/alumni.service';

const alumniService = new AlumniService();

export const getRecommendedAlumni = async (req: Request, res: Response) => {
    try {
        const studentId = req.query.studentId as string;
        if (!studentId) return res.status(400).json({ message: 'studentId required' });
        
        const recommendations = await alumniService.getRecommendedAlumni(studentId);
        res.json(recommendations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const searchAlumni = async (req: Request, res: Response) => {
    try {
        const { company, skills, departmentId } = req.query;
        const results = await alumniService.searchAlumni({
            company: company as string,
            skills: typeof skills === 'string' ? (skills as string).split(',') : (skills as any),
            departmentId: departmentId as string
        });
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const requestConnection = async (req: Request, res: Response) => {
    try {
        const { senderId, receiverUserId, message } = req.body;
        const result = await alumniService.requestConnection(senderId, receiverUserId, message);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateConnectionStatus = async (req: Request, res: Response) => {
    try {
        const { requestId, status } = req.body;
        const result = await alumniService.updateConnectionStatus(requestId, status);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPlacementAnalytics = async (req: Request, res: Response) => {
    try {
        const universityId = req.params.universityId as string;
        if (!universityId) return res.status(400).json({ message: 'universityId required' });
        const result = await alumniService.getPlacementAnalytics(universityId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
