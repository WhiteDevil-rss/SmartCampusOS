import { Response, Request } from 'express';
import prisma from '../lib/prisma';
import { ethers } from 'ethers';
import { AuthRequest } from '../middlewares/auth.middleware';
import { blockchainService } from '../services/blockchain.service';

export const submitApplication = async (req: Request, res: Response) => {
    try {
        const {
            universityId, departmentId, programId,
            applicantName, email, phone, documents
        } = req.body;

        const application = await prisma.admissionApplication.create({
            data: {
                universityId,
                departmentId,
                programId,
                applicantName,
                email,
                phone,
                documents: documents || {},
                status: 'SUBMITTED'
            }
        });

        // Record on Blockchain
        try {
            await blockchainService.updateAdmissionStatus(
                application.id,
                'PENDING', // Enrollment number not yet assigned
                programId,
                0, // Status: Submitted
                ethers.id(JSON.stringify(application.documents))
            );
        } catch (bcError) {
            console.error('Blockchain Admission Sync Failed (Submit):', bcError);
        }

        res.status(201).json(application);
    } catch (error: any) {
        console.error('Submit Application Error:', error);
        res.status(500).json({ error: 'Failed to submit admission application' });
    }
};

export const getApplications = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, departmentId, status, programId } = req.query;
        const where: any = {};

        if (universityId) where.universityId = universityId as string;
        if (departmentId) where.departmentId = departmentId as string;
        if (status) where.status = status as string;
        if (programId) where.programId = programId as string;

        const applications = await prisma.admissionApplication.findMany({
            where,
            include: {
                program: true,
                university: true
            },
            orderBy: { appliedAt: 'desc' }
        });

        res.json(applications);
    } catch (error: any) {
        console.error('Get Applications Error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status, remarks } = req.body;

        const application = await prisma.admissionApplication.update({
            where: { id },
            data: {
                status,
                remarks,
                updatedAt: new Date()
            }
        });

        // Record on Blockchain
        try {
            const statusMap: Record<string, number> = {
                'SUBMITTED': 0,
                'REVIEWING': 1,
                'SHORTLISTED': 2,
                'SELECTED': 3,
                'REJECTED': 4,
                'ONBOARDED': 5
            };

            await blockchainService.updateAdmissionStatus(
                application.id,
                'N/A', 
                application.programId,
                statusMap[status] || 1,
                ethers.id(remarks || 'Status Update')
            );
        } catch (bcError) {
            console.error('Blockchain Admission Sync Failed (Update):', bcError);
        }

        res.json(application);
    } catch (error: any) {
        console.error('Update Application Status Error:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
};

export const onboardStudent = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { batchId } = req.body;

        const application = await prisma.admissionApplication.findUnique({
            where: { id },
            include: { program: true }
        });

        if (!application || application.status !== 'SELECTED') {
            return res.status(400).json({ error: 'Application must be SELECTED before onboarding' });
        }

        if (!batchId) {
            return res.status(400).json({ error: 'Batch ID is required for onboarding' });
        }

        // 1. Create User
        const username = application.applicantName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
        const user = await prisma.user.create({
            data: {
                username,
                email: application.email,
                role: 'STUDENT',
                universityId: application.universityId,
                isActive: true
            }
        });

        // 2. Create Student
        const enrollmentNo = `STUDENT_${new Date().getFullYear()}_${Math.floor(Math.random() * 10000)}`;

        const student = await prisma.student.create({
            data: {
                universityId: application.universityId,
                departmentId: application.departmentId || '',
                enrollmentNo,
                batchId,
                programId: application.programId,
                name: application.applicantName,
                email: application.email,
                phone: application.phone,
                admissionYear: new Date().getFullYear()
            }
        });

        // 3. Update Application Status
        const updatedApplication = await prisma.admissionApplication.update({
            where: { id },
            data: { status: 'ONBOARDED' }
        });

        res.json({
            message: 'Student onboarded successfully',
            student,
            user: { id: user.id, username: user.username }
        });
    } catch (error: any) {
        console.error('Onboard Student Error:', error);
        res.status(500).json({ error: 'Failed to onboard student' });
    }
};

export const getPublicUniversities = async (req: Request, res: Response) => {
    try {
        const universities = await prisma.university.findMany({
            select: { id: true, name: true, shortName: true }
        });
        res.json(universities);
    } catch (error: any) {
        console.error('Get Public Universities Error:', error);
        res.status(500).json({ error: 'Failed to fetch universities' });
    }
};

export const getPublicDepartments = async (req: Request, res: Response) => {
    try {
        const { universityId } = req.query;
        if (!universityId) return res.json([]);
        const departments = await prisma.department.findMany({
            where: { universityId: universityId as string },
            select: { id: true, name: true, shortName: true }
        });
        res.json(departments);
    } catch (error: any) {
        console.error('Get Public Departments Error:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

export const getPublicPrograms = async (req: Request, res: Response) => {
    try {
        const { departmentId, universityId } = req.query;
        const where: any = {};
        if (departmentId) where.departmentId = departmentId as string;
        if (universityId) where.universityId = universityId as string;
        
        const programs = await prisma.program.findMany({
            where,
            select: { id: true, name: true, type: true, duration: true }
        });
        res.json(programs);
    } catch (error: any) {
        console.error('Get Public Programs Error:', error);
        res.status(500).json({ error: 'Failed to fetch programs' });
    }
};
