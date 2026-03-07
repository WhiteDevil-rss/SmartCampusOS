import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// We will simulate passing this to the Python AI Engine by wrapping it in a simple mock for now, 
// similar to the timetable engine approach but directly responding.
// In production, this would make an axios call to the Python microservice.
const generateAiResponse = async (query: string, studentContext: any): Promise<string> => {
    const keywords = ['syllabus', 'exam', 'attendance', 'deadline', 'drop', 'sgpa'];

    if (query.toLowerCase().includes('attendance')) {
        return `Based on your records, you are enrolled in ${studentContext.program}. Remember, SmartCampus OS mandates adherence to institutional attendance policies (typically 75%). If you have medical reasons, please submit an official service request via the portal.`;
    }
    if (query.toLowerCase().includes('sgpa') || query.toLowerCase().includes('grade')) {
        return `Your academic records are tracked semester by semester. To improve your SGPA, focus on completing assignments on time, as they carry significant weight in the internal evaluation.`;
    }
    if (query.toLowerCase().includes('syllabus')) {
        return `You can find the detailed syllabus for the ${studentContext.program} program under the 'Study Materials' section of your dashboard.`;
    }

    return `I am the SmartCampus OS Assistant. I can help you with questions regarding your courses, attendance, assignments, and institutional policies. Please feel free to ask a specific question!`;
};

export const askQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.entityId;
        const { message, threadId } = req.body;

        if (!studentId || !message) {
            return res.status(400).json({ error: 'Student ID and message are required' });
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { program: true, batch: true }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        // 1. Establish or fetch thread
        let currentThreadId = threadId;
        if (!currentThreadId) {
            // Check if there is an existing direct thread for this student with the AI system.
            // For simplicity, we just create a new one if not provided.
            const newThread = await prisma.chatThread.create({
                data: {
                    title: 'AI Doubt Assistant',
                    type: 'DIRECT',
                    participants: {
                        connect: [{ id: req.user!.id }]
                    }
                }
            });
            currentThreadId = newThread.id;
        }

        // 2. Save User Message
        const userMsg = await prisma.message.create({
            data: {
                threadId: currentThreadId,
                senderId: req.user!.id,
                content: message,
                type: 'TEXT'
            }
        });

        // 3. Generate AI Response
        // In a real scenario, this is an await axios.post to the separate Python AI Engine container.
        const aiReplyContent = await generateAiResponse(message, {
            program: student.program.name,
            semester: student.batch.semester
        });

        // 4. Save AI Response (Assuming we have a system AI user, or we just mock the senderId for now)
        // For simplicity, if we don't have a dedicated AI user, we'll just use a fixed ID or create one.
        // Let's see if an AI User exists, if not, create a fallback.
        let aiUser = await prisma.user.findFirst({ where: { role: 'SYSTEM_AI' } });
        if (!aiUser) {
            aiUser = await prisma.user.create({
                data: {
                    username: 'smartcampus-ai',
                    email: 'ai@smartcampus.ac.in',
                    role: 'SYSTEM_AI',
                    isActive: true
                }
            });
        }

        const aiMsg = await prisma.message.create({
            data: {
                threadId: currentThreadId,
                senderId: aiUser!.id,
                content: aiReplyContent,
                type: 'TEXT'
            }
        });

        res.json({
            threadId: currentThreadId,
            userMessage: userMsg,
            aiMessage: aiMsg
        });

    } catch (error: any) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to process AI response' });
    }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Find the 'AI Doubt Assistant' thread for this user
        const thread = await prisma.chatThread.findFirst({
            where: {
                title: 'AI Doubt Assistant',
                participants: {
                    some: { id: userId }
                }
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { id: true, role: true, username: true } } }
                }
            }
        });

        if (!thread) {
            return res.json({ threadId: null, messages: [] });
        }

        res.json({
            threadId: thread.id,
            messages: thread.messages
        });

    } catch (error: any) {
        console.error('Chat History Error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};
