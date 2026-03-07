import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: req.user?.email }
                ]
            }
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const serviceRequests = await prisma.serviceRequest.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' }
        });

        const complaints = await prisma.complaint.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ serviceRequests, complaints });
    } catch (error: any) {
        console.error('Get Requests Error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

export const createServiceRequest = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { type, description, attachments } = req.body;

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: req.user?.email }
                ]
            }
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const request = await prisma.serviceRequest.create({
            data: {
                studentId: student.id,
                type,
                description,
                attachments
            }
        });

        res.status(201).json(request);
    } catch (error: any) {
        console.error('Create Service Request Error:', error);
        res.status(500).json({ error: 'Failed to create service request' });
    }
};

export const createComplaint = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { category, subject, description } = req.body;

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: req.user?.email }
                ]
            }
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const complaint = await prisma.complaint.create({
            data: {
                universityId: student.universityId,
                studentId: student.id,
                category,
                subject,
                description
            }
        });

        res.status(201).json(complaint);
    } catch (error: any) {
        console.error('Create Complaint Error:', error);
        res.status(500).json({ error: 'Failed to create complaint' });
    }
};

export const generateDocument = async (req: AuthRequest, res: Response) => {
    try {
        const requestId = req.params.requestId as string;
        const userId = req.user?.id;
        const entityId = req.user?.entityId;

        const request = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: {
                student: {
                    include: {
                        university: true,
                        department: true,
                        batch: true,
                        program: true
                    }
                }
            }
        });

        if (!request || !request.student) return res.status(404).json({ error: 'Request or student data not found' });

        // Security check
        if (request.studentId !== entityId && request.student.email !== req.user?.email) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (request.status !== 'APPROVED' && request.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Document can only be generated for approved or completed requests' });
        }

        // Simulate document generation
        const documentData = {
            title: `${request.type} Certificate`,
            studentName: request.student.name,
            enrollmentNo: request.student.enrollmentNo,
            university: request.student.university.name,
            department: request.student.department.name,
            program: request.student.program.name,
            semester: request.student.batch.semester,
            issuedAt: new Date(),
            verificationCode: `VER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        };

        res.json(documentData);
    } catch (error: any) {
        console.error('Generate Document Error:', error);
        res.status(500).json({ error: 'Failed to generate document' });
    }
};
