import prisma from '../lib/prisma';
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export const runFacultyAudit = async (facultyId: string, academicYear: string, semester: number) => {
    // 1. Fetch Faculty and related performance markers
    const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
        include: {
            feedback: {
                where: { academicYear, semester }
            },
            publications: true,
            grants: true,
            reviews: true
        }
    });

    if (!faculty) throw new Error('Faculty not found');

    // 2. Data aggregation
    const avgFeedback = faculty.feedback.length > 0 
        ? faculty.feedback.reduce((sum, f) => sum + f.rating, 0) / faculty.feedback.length 
        : 0;
    
    const totalGrants = faculty.grants.reduce((sum, g) => sum + g.amount, 0);
    const pubImpact = faculty.publications.reduce((sum, p) => sum + (p.citationsCount || 0) + (p.impactFactor || 0), 0);

    // 3. AI Performance Synthesis
    const prompt = `
        As an Elite Academic Auditor for SmartCampus OS, perform a 360-degree performance audit for:
        Faculty Name: ${faculty.name}
        Academic Period: ${academicYear} (Semester ${semester})

        DATA POINTS:
        - Student Feedback: ${avgFeedback.toFixed(2)}/5 (from ${faculty.feedback.length} students)
        - Research Publications: ${faculty.publications.length} (Impact Score: ${pubImpact.toFixed(1)})
        - Research Grants Secured: $${totalGrants.toLocaleString()}
        - Peer Reviews Performed: ${faculty.reviews.length}

        TASKS:
        1. Summarize their qualitative impact on the department.
        2. Identify specific strengths and hidden bottlenecks.
        3. Provide 3 high-impact recommendations for their career progression.
        4. Calculate a teaching score (0-100) and research impact (0-100).
        5. Assign an overall performance score (0-100).

        Return the audit results in a strict JSON format:
        {
            "overallScore": number,
            "researchImpact": number,
            "teachingScore": number,
            "aiSummary": "Executive summary string",
            "recommendations": "Bullet points string",
            "metrics": {
                "feedbackAvg": number,
                "grantTotal": number,
                "pubCount": number
            }
        }
    `;

    try {
        const response = await axios.post(OLLAMA_URL, {
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            format: 'json'
        });

        const result = JSON.parse(response.data.response);

        // 4. Persistence
        const audit = await prisma.facultyAudit.create({
            data: {
                facultyId,
                academicYear,
                semester,
                overallScore: result.overallScore,
                researchImpact: result.researchImpact,
                teachingScore: result.teachingScore,
                aiSummary: result.aiSummary,
                recommendations: result.recommendations,
                status: 'FINALIZED'
            }
        });

        return audit;
    } catch (error) {
        console.error('Faculty Audit AI Error:', error);
        throw error;
    }
};

export const getFacultyPerformanceHistory = async (facultyId: string) => {
    return prisma.facultyAudit.findMany({
        where: { facultyId },
        orderBy: { createdAt: 'desc' }
    });
};
