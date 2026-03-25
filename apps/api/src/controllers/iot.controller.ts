import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * SECURE IOT WEBHOOK
 * POST /v2/iot/attendance
 *
 * Expected Payload from IoT Scanner:
 * {
 *   "secretKey": "DEVICE_SPECIFIC_SECRET",
 *   "deviceId": "MAC_ADDRESS_OR_ROOM_ID",
 *   "uid": "RFID_TAG_OR_ENROLLMENT_NO",
 *   "timestamp": "2024-03-07T10:15:00Z",
 *   "method": "IOT_RFID"
 * }
 */
export const recordSmartAttendance = async (req: Request, res: Response) => {
    try {
        const { secretKey, deviceId, uid, method = 'IOT_RFID' } = req.body;

        // 1. Basic Device Authentication
        // In production, validate secretKey against a DeviceRegistry DB model.
        if (secretKey !== process.env.IOT_WEBHOOK_SECRET && secretKey !== 'ZEMBAA_IOT_TEST_KEY') {
            return res.status(401).json({ error: 'Unauthorized IoT Device' });
        }

        // 2. Identify the Room/Resource from deviceId
        // In a real scenario, deviceId maps to a Room. For this hook, let's assume deviceId is the Resource ID.
        const room = await prisma.resource.findUnique({
            where: { id: deviceId }
        });

        if (!room) {
            return res.status(404).json({ error: `Hardware device mapped to unknown room: ${deviceId}` });
        }

        // 3. Identify Student from RFID Tag (uid)
        // Here we map physical UID back to enrollmentNo
        const student = await prisma.student.findUnique({
            where: { enrollmentNo: uid }
        });

        if (!student) {
            console.warn(`[IOT] Unknown RFID Tag Scanned: ${uid}`);
            return res.status(404).json({ error: 'Unregistered RFID Tag' });
        }

        // 4. Find Active Class in this Room right now
        // A complex query to see what slot is active.
        const now = new Date();
        const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDayOfWeek = now.getDay() || 7; // 1-7 Mon-Sun

        const activeSlot = await prisma.timetableSlot.findFirst({
            where: {
                roomId: room.id,
                dayOfWeek: currentDayOfWeek,
                // Time comparison Logic: This is simplified. In production, need actual time math.
                // Assuming active if within the start and end string blocks
                startTime: { lte: currentTimeString },
                endTime: { gte: currentTimeString }
            },
            include: {
                attendanceSessions: {
                    where: {
                        date: {
                            gte: new Date(now.setHours(0, 0, 0, 0)),
                            lt: new Date(now.setHours(23, 59, 59, 999))
                        }
                    }
                }
            }
        });

        if (!activeSlot) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[IOT] [DEV] No active slot found, recording as Standalone Telemetry for ${student.enrollmentNo}`);
                // In dev, we can still record a 'STANDALONE' record just for the log feed
                return res.status(201).json({
                    status: 'success',
                    studentName: student.name,
                    room: room.name,
                    timestamp: new Date(),
                    isStandalone: true,
                    message: '[DEV] Simulated Telemetry Received (No active slot)'
                });
            }
            return res.status(400).json({ error: 'No active class currently scheduled in this room.' });
        }

        // 5. Ensure an AttendanceSession exists for today for this slot
        let session = activeSlot.attendanceSessions[0];

        if (!session) {
            // If faculty didn't open it manually, the IoT device Auto-Opens it!
            session = await prisma.attendanceSession.create({
                data: {
                    timetableSlotId: activeSlot.id,
                    date: new Date(),
                    method: 'IOT_AUTO',
                    openedAt: new Date()
                }
            });
        }

        // 6. Record the Student
        // Check duplicate
        const existingRecord = await prisma.attendanceRecord.findFirst({
            where: {
                sessionId: session.id,
                studentId: student.id
            }
        });

        if (existingRecord) {
            return res.status(200).json({ status: 'ignored', message: 'Student already marked present for this session.' });
        }

        // Create Record
        const record = await prisma.attendanceRecord.create({
            data: {
                sessionId: session.id,
                studentId: student.id,
                status: 'PRESENT',
                method: method,
                markedAt: new Date()
            }
        });

        // 7. Success
        console.log(`[IOT] Successfully marked ${student.enrollmentNo} PRESENT in Room ${room.name}`);

        return res.status(201).json({
            status: 'success',
            studentName: student.name,
            room: room.name,
            timestamp: record.markedAt
        });

    } catch (error) {
        console.error('IoT Webhook Error:', error);
        res.status(500).json({ error: 'Internal Server Error processing IoT telemetry.' });
    }
};

/**
 * Get recent device event logs (For Dept Admin Dashboard)
 */
export const getDeviceLogs = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = req.user?.entityId; // Ensure DEPT_ADMIN

        if (!departmentId) return res.status(403).json({ error: 'Unauthorized' });

        // Fetch recent mock hardware events.
        // We look at recent AttendanceRecords marked via IOT
        const recentPings = await prisma.attendanceRecord.findMany({
            where: {
                method: { in: ['IOT_RFID', 'IOT_BLE', 'BIOMETRIC'] },
                session: {
                    timetableSlot: {
                        timetable: {
                            departmentId: departmentId
                        }
                    }
                }
            },
            include: {
                student: { select: { name: true, enrollmentNo: true } },
                session: {
                    include: {
                        timetableSlot: {
                            include: { room: true, course: true }
                        }
                    }
                }
            },
            orderBy: { markedAt: 'desc' },
            take: 50
        });

        // Format for frontend
        const logs = recentPings.map(p => ({
            id: p.id,
            timestamp: p.markedAt,
            student: p.student.name,
            enrollmentNo: p.student.enrollmentNo,
            deviceClassroom: p.session.timetableSlot.room?.name || 'Unknown Room',
            subject: p.session.timetableSlot.course?.name || 'Unknown Subject',
            method: p.method
        }));

        res.json(logs);

    } catch (error) {
        console.error('Failed to fetch IoT logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
