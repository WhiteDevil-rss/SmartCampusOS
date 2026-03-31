import { PrismaClient } from '../generated/client';
import axios from 'axios';

const prisma = new PrismaClient();
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3';

export const toggleMentorProfile = async (studentId: string, profileData: { bio?: string; expertise: string[] }) => {
    return prisma.mentorProfile.upsert({
        where: { studentId },
        update: {
            isActive: true,
            bio: profileData.bio,
            expertise: profileData.expertise,
        },
        create: {
            studentId,
            isActive: true,
            bio: profileData.bio,
            expertise: profileData.expertise,
        },
    });
};

export const getSuggestedMentors = async (studentId: string) => {
    // 1. Get student's academic context (Risk & Results)
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            academicRisk: true,
            results: {
                orderBy: { semester: 'desc' },
                take: 5
            }
        }
    });

    if (!student) throw new Error('Student not found');

    // 2. Identify "Weak" subjects (SGPA < 6 or specific subject results < 40/100)
    // Using current SubjectResult records
    const studentWithSubjectResults = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            results: {
                include: { subjectResults: { include: { course: true } } },
                orderBy: { semester: 'desc' },
                take: 1
            }
        }
    });

    const weakSubjects = studentWithSubjectResults?.results[0]?.subjectResults
        .filter(sr => {
            const total = (sr.internalMarks || 0) + (sr.midTermMarks || 0) + (sr.externalMarks || 0);
            return total < 50;
        })
        .map(sr => sr.course.name) || [];

    // 3. Find mentors with matching expertise
    const potentialMentors = await prisma.mentorProfile.findMany({
        where: {
            isActive: true,
            studentId: { not: studentId },
            // Expertise is stored as Json (string array)
        },
        include: {
            student: {
                select: {
                    name: true,
                    email: true,
                    department: { select: { name: true } }
                }
            }
        }
    });

    // 4. Filter by expertise (Json filtering in Prisma can be tricky, so we'll do it in JS)
    const filteredMentors = potentialMentors.filter(m => {
        const expertiseArr = m.expertise as string[];
        return expertiseArr.some(e => weakSubjects.includes(e));
    });

    // 5. Use AI to refine suggestions (Optional/Heuristic if AI offline)
    try {
        const prompt = `
            Student "${student.name}" needs help in these subjects: ${weakSubjects.join(', ')}.
            Below is a list of potential peer mentors:
            ${filteredMentors.map(m => `- ${m.student.name} (Expertise: ${(m.expertise as string[]).join(', ')}, Bio: ${m.bio})`).join('\n')}

            Rank the top 3 mentors for this student.
            Provide a short "Compatibility Reason" for each.

            Return ONLY a JSON array:
            [
              { "mentorProfileId": "string", "name": "string", "reason": "string", "expertiseOverlap": string[] }
            ]
        `;

        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        const refined = JSON.parse(response.data.response);
        return refined;
    } catch (error) {
        // Fallback: Return top 3 filtered mentors by rating
        return filteredMentors
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3)
            .map(m => ({
                mentorProfileId: m.id,
                name: m.student.name,
                reason: "High peer rating and expertise match.",
                expertiseOverlap: (m.expertise as string[]).filter(e => weakSubjects.includes(e))
            }));
    }
};

export const requestMentorship = async (menteeId: string, mentorProfileId: string, subject: string) => {
    return prisma.mentorshipRelation.create({
        data: {
            menteeId,
            mentorProfileId,
            subject,
            status: 'PENDING'
        }
    });
};
