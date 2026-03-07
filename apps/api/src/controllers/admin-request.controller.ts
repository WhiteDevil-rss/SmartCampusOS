import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// --- SERVICE REQUESTS (BONAFIDE, TRANSCRIPTS, ID CARDS) ---

export const getServiceRequests = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, departmentId, status, type } = req.query;
        const where: any = {};

        if (universityId) {
            where.student = { universityId: universityId as string };
        }
        if (departmentId) {
            where.student = {
                ...(where.student || {}),
                departmentId: departmentId as string
            };
        }
        if (status) where.status = status as string;
        if (type) where.type = type as string;

        const requests = await prisma.serviceRequest.findMany({
            where,
            include: {
                student: {
                    include: {
                        program: true,
                        batch: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error: any) {
        console.error('Get Service Requests Error:', error);
        res.status(500).json({ error: 'Failed to fetch service requests' });
    }
};

export const createServiceRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, type, description, attachments } = req.body;

        const request = await prisma.serviceRequest.create({
            data: {
                studentId,
                type,
                description,
                attachments: attachments || {},
                status: 'PENDING'
            }
        });

        res.status(201).json(request);
    } catch (error: any) {
        console.error('Create Service Request Error:', error);
        res.status(500).json({ error: 'Failed to create service request' });
    }
};

export const updateServiceRequest = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status, approvedBy } = req.body;

        const request = await prisma.serviceRequest.update({
            where: { id },
            data: {
                status,
                approvedBy,
                updatedAt: new Date()
            }
        });

        res.json(request);
    } catch (error: any) {
        console.error('Update Service Request Error:', error);
        res.status(500).json({ error: 'Failed to update service request' });
    }
};

// --- COMPLAINTS & GRIEVANCES ---

export const getComplaints = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, status, category } = req.query;
        const where: any = {};

        if (universityId) where.universityId = universityId as string;
        if (status) where.status = status as string;
        if (category) where.category = category as string;

        const complaints = await prisma.complaint.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        enrollmentNo: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Hide student info for anonymous complaints
        const safetyComplaints = complaints.map(c => {
            if (c.isAnonymous) {
                return { ...c, student: null, studentId: null };
            }
            return c;
        });

        res.json(safetyComplaints);
    } catch (error: any) {
        console.error('Get Complaints Error:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

export const createComplaint = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, studentId, category, subject, description, isAnonymous } = req.body;

        const complaint = await prisma.complaint.create({
            data: {
                universityId,
                studentId: isAnonymous ? null : studentId,
                category,
                subject,
                description,
                isAnonymous: !!isAnonymous,
                status: 'OPEN'
            }
        });

        res.status(201).json(complaint);
    } catch (error: any) {
        console.error('Create Complaint Error:', error);
        res.status(500).json({ error: 'Failed to create complaint' });
    }
};

export const resolveComplaint = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status, resolution } = req.body;

        const complaint = await prisma.complaint.update({
            where: { id },
            data: {
                status,
                resolution,
                updatedAt: new Date()
            }
        });

        res.json(complaint);
    } catch (error: any) {
        console.error('Resolve Complaint Error:', error);
        res.status(500).json({ error: 'Failed to resolve complaint' });
    }
};
