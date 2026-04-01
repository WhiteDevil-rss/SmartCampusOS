import prisma from '../lib/prisma';
import { matchAlumni } from './ai.service';
import { NotificationService } from './notification.service';

export class AlumniService {
    /**
     * Get AI-powered alumni recommendations for a student.
     */
    async getRecommendedAlumni(studentId: string) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                skills: true,
                industryReadiness: true,
            }
        });

        if (!student) throw new Error('Student not found');

        // Fetch all alumni (students who graduated)
        const alumni = await prisma.student.findMany({
            where: { isAlumnus: true },
            select: {
                id: true,
                userId: true,
                name: true,
                department: { select: { name: true } },
                batch: { select: { name: true } },
                currentCompany: true,
                currentRole: true,
                skills: true,
                industryExperience: true,
            }
        });

        if (alumni.length === 0) return { matches: [], topSkillsInDemand: [] };

        // Prepare payload for AI Engine
        const payload = {
            studentId: student.id,
            skills: student.skills || [],
            interestAreas: [], // Could be fetched from a career profile model if added
            alumniProfiles: alumni.map((a: any) => ({
                studentId: a.id,
                userId: a.userId,
                name: a.name,
                department: a.department.name,
                batch: a.batch.name,
                currentCompany: a.currentCompany,
                currentRole: a.currentRole,
                skills: a.skills || [],
                experience: (a.industryExperience as any[]) || []
            }))
        };

        return await matchAlumni(payload);
    }

    /**
     * Search the alumni directory.
     */
    async searchAlumni(filters: { company?: string, skills?: string[], departmentId?: string }) {
        const normalizedSkills = filters.skills?.map((skill) => skill.trim()).filter(Boolean);

        return prisma.student.findMany({
            where: {
                isAlumnus: true,
                departmentId: filters.departmentId,
                currentCompany: filters.company ? { contains: filters.company, mode: 'insensitive' } : undefined,
                AND: normalizedSkills?.length
                    ? normalizedSkills.map((skill) => ({
                        skills: { array_contains: [skill] }
                    }))
                    : undefined
            },
            include: {
                department: true,
                batch: true
            }
        });
    }

    /**
     * Request a connection with an Alumnus.
     */
    async requestConnection(senderId: string, receiverUserId: string, message?: string) {
        const request = await prisma.connectRequest.create({
            data: {
                senderId,
                receiverId: receiverUserId,
                message,
                status: 'PENDING'
            },
            include: {
                sender: true
            }
        });

        // Notify the receiver using the NotificationService
        await NotificationService.send({
            userId: receiverUserId,
            title: 'New Connection Request',
            message: `${request.sender.username} wants to connect with you on SmartCampus.`,
            category: 'SOCIAL',
            metadata: {
                requestId: request.id,
                senderId: request.senderId
            }
        });

        return request;
    }

    /**
     * Handle connection status updates.
     */
    async updateConnectionStatus(requestId: string, status: 'ACCEPTED' | 'REJECTED') {
        const request = await prisma.connectRequest.update({
            where: { id: requestId },
            data: { status },
            include: {
                receiver: true
            }
        });

        if (status === 'ACCEPTED') {
            await NotificationService.send({
                userId: request.senderId,
                title: 'Connection Accepted!',
                message: `${request.receiver.username} accepted your networking request.`,
                category: 'SOCIAL'
            });
        }

        return request;
    }

    /**
     * Placement Analytics for Admins.
     */
    async getPlacementAnalytics(universityId: string) {
        const records = await prisma.placementRecord.findMany({
            where: { student: { universityId } },
            include: {
                student: { include: { department: true } },
                company: true
            }
        });

        // Aggregate by department
        const deptStats: Record<string, { count: number, totalCtc: number }> = {};
        records.forEach((r: any) => {
            const dept = r.student.department.name;
            if (!deptStats[dept]) deptStats[dept] = { count: 0, totalCtc: 0 };
            deptStats[dept].count += 1;
            deptStats[dept].totalCtc += r.ctc;
        });

        const chartData = Object.entries(deptStats).map(([name, stats]) => ({
            name,
            count: stats.count,
            avgCtc: stats.count > 0 ? (stats.totalCtc / stats.count).toFixed(2) : 0
        }));

        return {
            totalPlaced: records.length,
            averagePackage: records.length > 0 ? (records.reduce((acc: number, curr: any) => acc + curr.ctc, 0) / records.length).toFixed(2) : 0,
            departmentalBreakdown: chartData,
            recentPlacements: records.slice(0, 5)
        };
    }
}
