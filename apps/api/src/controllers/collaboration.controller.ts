import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as mentorshipService from '../services/mentorship.service';
import * as collaborationService from '../services/collaboration.service';
import prisma from '../lib/prisma';

// --- Mentorship Endpoints ---

export const toggleMentorProfile = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.id;
        const { bio, expertise } = req.body;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const profile = await mentorshipService.toggleMentorProfile(studentId, { bio, expertise });
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSuggestedMentors = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const suggestions = await mentorshipService.getSuggestedMentors(studentId);
        res.json(suggestions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const requestMentorship = async (req: AuthRequest, res: Response) => {
    try {
        const menteeId = req.user?.id;
        const { mentorProfileId, subject } = req.body;

        if (!menteeId) return res.status(401).json({ error: 'Unauthorized' });

        const request = await mentorshipService.requestMentorship(menteeId, mentorProfileId, subject);
        res.status(201).json(request);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Study Group Endpoints ---

export const createStudyGroup = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user?.id;
        const departmentId = req.user?.entityId; // Context from token
        const { title, description, subject, isPrivate } = req.body;

        if (!adminId || !departmentId) return res.status(401).json({ error: 'Context missing' });

        const group = await collaborationService.createStudyGroup(departmentId, adminId, { title, description, subject, isPrivate });
        res.status(201).json(group);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const joinGroup = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.id;
        const { groupId } = req.params;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const membership = await collaborationService.joinStudyGroup(groupId as string, studentId);
        res.json(membership);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAvailableGroups = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = req.user?.entityId;
        if (!departmentId) return res.status(401).json({ error: 'Context missing' });

        const groups = await collaborationService.getDepartmentStudyGroups(departmentId);
        res.json(groups);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Resource Endpoints ---

export const uploadResource = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.id;
        const { groupId, title, description, fileUrl, fileType, subject } = req.body;

        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const resource = await collaborationService.uploadResource(studentId, { groupId, title, description, fileUrl, fileType, subject });
        res.status(201).json(resource);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
