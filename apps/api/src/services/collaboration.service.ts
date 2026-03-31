import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

export const createStudyGroup = async (departmentId: string, adminId: string, data: { title: string; description?: string; subject?: string; isPrivate?: boolean }) => {
    return prisma.$transaction(async (tx) => {
        const group = await tx.studyGroup.create({
            data: {
                departmentId,
                title: data.title,
                description: data.description,
                subject: data.subject,
                isPrivate: data.isPrivate ?? false,
            },
        });

        await tx.studyGroupMember.create({
            data: {
                groupId: group.id,
                studentId: adminId,
                role: 'ADMIN',
            },
        });

        return group;
    });
};

export const joinStudyGroup = async (groupId: string, studentId: string) => {
    return prisma.studyGroupMember.create({
        data: {
            groupId,
            studentId,
            role: 'MEMBER',
        },
    });
};

export const leaveStudyGroup = async (groupId: string, studentId: string) => {
    return prisma.studyGroupMember.delete({
        where: {
            groupId_studentId: {
                groupId,
                studentId,
            },
        },
    });
};

export const uploadResource = async (studentId: string, data: { groupId?: string; title: string; description?: string; fileUrl: string; fileType: string; subject?: string }) => {
    return prisma.collaborationResource.create({
        data: {
            studentId,
            groupId: data.groupId,
            title: data.title,
            description: data.description,
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            subject: data.subject,
        },
    });
};

export const getDepartmentStudyGroups = async (departmentId: string) => {
    return prisma.studyGroup.findMany({
        where: {
            departmentId,
            isPrivate: false,
        },
        include: {
            members: {
                include: {
                    student: {
                        select: { name: true, photoUrl: true }
                    }
                }
            },
            _count: {
                select: { members: true, resources: true }
            }
        },
    });
};

export const getStudentGroups = async (studentId: string) => {
    return prisma.studyGroup.findMany({
        where: {
            members: {
                some: { studentId }
            }
        },
        include: {
            _count: {
                select: { members: true }
            }
        }
    });
};
