import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: req.user?.email }
                ]
            },
            include: {
                attendance: {
                    include: {
                        session: {
                            include: {
                                timetableSlot: {
                                    include: {
                                        course: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { markedAt: 'asc' } // Ascending for heatmap chronological order
                }
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        const attendanceRecords = student.attendance;

        // 1. Overall Calculation
        let totalClasses = 0;
        let presentClasses = 0;

        // 2. Subject-wise Calculation
        const subjects: Record<string, { id: string, name: string, code: string, present: number, total: number }> = {};

        // 3. Heatmap Calculation (YYYY-MM-DD -> present count)
        const heatmapData: Record<string, number> = {};

        attendanceRecords.forEach((record) => {
            const course = record.session?.timetableSlot?.course;
            const dateStr = record.session?.date ? new Date(record.session.date).toISOString().split('T')[0] : null;

            if (!course) return;

            // Overall
            totalClasses++;
            if (record.status === 'PRESENT') {
                presentClasses++;
            }

            // Subject-wise
            if (!subjects[course.id]) {
                subjects[course.id] = { id: course.id, name: course.name, code: course.code, present: 0, total: 0 };
            }
            subjects[course.id].total++;
            if (record.status === 'PRESENT') {
                subjects[course.id].present++;
            }

            // Heatmap
            if (dateStr) {
                if (!heatmapData[dateStr]) heatmapData[dateStr] = 0;
                if (record.status === 'PRESENT') heatmapData[dateStr]++;
                // If they are absent, we still ensured the day string exists (valuable for tracking if they had classes that day)
            }
        });

        const overallPercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

        const subjectBreakdown = Object.values(subjects).map(sub => {
            const percentage = sub.total > 0 ? Math.round((sub.present / sub.total) * 100) : 0;

            // "Missing Classes Warning" logic (Target: 75%)
            let warningText = "On Track";
            let warningStatus = "SAFE"; // SAFE, WARNING, DANGER

            if (percentage < 75) {
                // How many consecutive present needed to hit 75%
                // (present + x) / (total + x) = 0.75
                // present + x = 0.75*total + 0.75*x
                // 0.25*x = 0.75*total - present
                // x = (0.75*total - present) * 4
                const classesNeededToHit75 = Math.ceil((0.75 * sub.total - sub.present) * 4);
                warningText = `Need to attend next ${classesNeededToHit75} classes to hit 75%`;
                warningStatus = percentage < 60 ? "DANGER" : "WARNING";
            } else {
                // How many can they miss and still remain >= 75%
                // present / (total + x) = 0.75 
                // present = 0.75*total + 0.75*x
                // 0.75*x = present - 0.75*total
                // x = (present - 0.75*total) / 0.75
                const classesCanMiss = Math.floor((sub.present - 0.75 * sub.total) / 0.75);
                warningText = `Can afford to miss ${classesCanMiss} upcoming classes`;
                warningStatus = "SAFE";
            }

            return {
                ...sub,
                percentage,
                warningText,
                warningStatus
            };
        });

        const heatmapArray = Object.keys(heatmapData).map(date => ({
            date,
            count: heatmapData[date] // Count of 'PRESENT' statuses that day
        }));

        res.json({
            overall: {
                totalClasses,
                presentClasses,
                percentage: overallPercentage
            },
            subjects: subjectBreakdown,
            heatmap: heatmapArray
        });

    } catch (error: any) {
        console.error('Get Attendance Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance dashboard' });
    }
};
