import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getStudentTimetable = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // 1. Find Student by User ID (assumes email matches if ID doesn't directly map)
        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: req.user?.email }
                ]
            },
            include: {
                electiveMappings: true
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        // 2. Fetch the active timetable for the student's batch
        const timetable = await prisma.timetable.findFirst({
            where: {
                batchId: student.batchId,
                status: 'ACTIVE'
            },
            include: {
                slots: {
                    include: {
                        course: true,
                        faculty: true,
                        faculty2: true,
                        room: true,
                        block: true,
                        timetableChanges: {
                            where: {
                                // Optionally filter to show only future changes or changes this week
                                date: {
                                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                                }
                            },
                            include: {
                                substituteFaculty: true,
                                newRoom: true
                            }
                        }
                    }
                }
            }
        });

        if (!timetable) {
            return res.json({ message: 'No active timetable found for your batch', timetable: null });
        }

        // 3. Filter slots based on student's elective choices
        const chosenOptionIds = student.electiveMappings.map(mapping => mapping.optionId);

        const filteredSlots = timetable.slots.filter(slot => {
            if (!slot.isElective) return true; // Keep compulsory courses
            if (!slot.optionId) return false; // Malformed elective slot
            return chosenOptionIds.includes(slot.optionId); // Keep only chosen electives
        });

        const personalizedTimetable = {
            ...timetable,
            slots: filteredSlots
        };

        res.json(personalizedTimetable);
    } catch (error: any) {
        console.error('Get Timetable Error:', error);
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
};

export const getTodayTimetable = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: { OR: [{ id: userId }, { email: req.user?.email }] },
            include: { electiveMappings: true }
        });

        if (!student) return res.status(404).json({ error: 'Student profile not found' });

        const todayDayOfWeek = new Date().getDay() || 7; // 1=Mon...7=Sun

        const timetable = await prisma.timetable.findFirst({
            where: { batchId: student.batchId, status: 'ACTIVE' },
            include: {
                slots: {
                    where: { dayOfWeek: todayDayOfWeek },
                    include: {
                        course: true, faculty: true, room: true, block: true,
                        timetableChanges: {
                            where: {
                                date: {
                                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                    lt: new Date(new Date().setHours(23, 59, 59, 999))
                                }
                            },
                            include: { substituteFaculty: true, newRoom: true }
                        }
                    }
                }
            }
        });

        if (!timetable) return res.json({ slots: [] });

        const chosenOptionIds = student.electiveMappings.map(m => m.optionId);
        const filteredSlots = timetable.slots.filter(slot => {
            if (!slot.isElective) return true;
            return slot.optionId ? chosenOptionIds.includes(slot.optionId) : false;
        });

        res.json({ slots: filteredSlots });
    } catch (error: any) {
        console.error('Get Today Timetable Error:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s timetable' });
    }
};

export const getTimetableChanges = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: { OR: [{ id: userId }, { email: req.user?.email }] }
        });

        if (!student) return res.status(404).json({ error: 'Student profile not found' });

        const daysLookahead = 7;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + daysLookahead);

        const changes = await prisma.timetableChange.findMany({
            where: {
                originalSlot: {
                    timetable: {
                        batchId: student.batchId,
                        status: 'ACTIVE'
                    }
                },
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)), // From today
                    lte: endDate // Till next 7 days
                }
            },
            include: {
                originalSlot: {
                    include: { course: true, room: true }
                },
                substituteFaculty: true,
                newRoom: true
            },
            orderBy: { date: 'asc' }
        });

        // Further filter by chosen electives could be done here as well
        res.json(changes);
    } catch (error: any) {
        console.error('Get Timetable Changes Error:', error);
        res.status(500).json({ error: 'Failed to fetch timetable changes' });
    }
};

export const submitElectiveSelection = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { basketId, optionId } = req.body;

        if (!basketId || !optionId) {
            return res.status(400).json({ error: 'basketId and optionId are required' });
        }

        const student = await prisma.student.findFirst({
            where: { OR: [{ id: userId }, { email: req.user?.email }] }
        });

        if (!student) return res.status(404).json({ error: 'Student profile not found' });

        // Upsert the choice: Update if exists, else Create
        const mapping = await prisma.studentElectiveMapping.upsert({
            where: {
                studentId_basketId: {
                    studentId: student.id,
                    basketId: basketId
                }
            },
            update: { optionId: optionId },
            create: {
                studentId: student.id,
                basketId: basketId,
                optionId: optionId
            }
        });

        res.json({ message: 'Elective choice saved successfully', mapping });
    } catch (error: any) {
        console.error('Submit Elective Selection Error:', error);
        res.status(500).json({ error: 'Failed to save elective selection' });
    }
};
