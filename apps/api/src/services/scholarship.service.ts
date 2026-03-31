import prisma from '../lib/prisma';

/**
 * Scholarship Service — v1.0.0
 * Manages institutional and external scholarship listings and student applications.
 */

export const getScholarshipsForUniversity = async (universityId: string) => {
    return await prisma.scholarship.findMany({
        where: {
            universityId,
            isActive: true
        },
        orderBy: {
            amount: 'desc'
        }
    });
};

export const applyForScholarship = async (studentId: string, scholarshipId: string) => {
    // Check if scholarship exists and is active
    const scholarship = await prisma.scholarship.findUnique({
        where: { id: scholarshipId }
    });

    if (!scholarship || !scholarship.isActive) {
        throw new Error('Scholarship not found or inactive');
    }

    // Check for existing application
    const existing = await prisma.grantApplication.findFirst({
        where: {
            studentId,
            scholarshipId
        }
    });

    if (existing) {
        throw new Error('Application already exists for this scholarship');
    }

    return await prisma.grantApplication.create({
        data: {
            studentId,
            scholarshipId,
            status: 'PENDING'
        },
        include: {
            scholarship: true
        }
    });
};

export const getStudentApplications = async (studentId: string) => {
    return await prisma.grantApplication.findMany({
        where: {
            studentId
        },
        include: {
            scholarship: true
        },
        orderBy: {
            appliedAt: 'desc'
        }
    });
};

export const updateApplicationStatus = async (applicationId: string, status: string, remarks?: string) => {
    const updateData: any = { status, remarks };
    
    if (status === 'APPROVED') {
        updateData.approvedAt = new Date();
    } else if (status === 'DISBURSED') {
        updateData.disbursedAt = new Date();
    }

    return await prisma.grantApplication.update({
        where: { id: applicationId },
        data: updateData,
        include: {
            scholarship: true,
            student: true
        }
    });
};
