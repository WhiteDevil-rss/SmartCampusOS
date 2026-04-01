import prisma from '../lib/prisma';
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export const analyzeCurriculumAlignment = async (courseId: string, academicYear: string) => {
    // 1. Fetch Course and Study Materials
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            studyMaterials: true,
            department: true
        }
    });

    if (!course) throw new Error('Course not found');

    // 2. Prepare analysis context
    const materialsSummary = course.studyMaterials.map(m => `- ${m.title}: ${m.description || 'No description'}`).join('\n');
    const deptGoals = course.department?.name || 'General Academic Excellence';

    // 3. AI Alignment Analysis
    const prompt = `
        As an AI Curriculum Specialist for SmartCampus OS, analyze the alignment between teaching materials and institutional goals for the course:
        Course: ${course.name} (${course.code})
        Department Context: ${deptGoals}

        TEACHING MATERIALS PROVIDED:
        ${materialsSummary || 'No materials uploaded yet.'}

        TASKS:
        1. Compare the materials against standard industry expectations for this course.
        2. Identify specific logical gaps (e.g., "Missing hands-on lab documentation", "Outdated theory references").
        3. Rate the alignment from 0 to 100.
        4. Suggest 3 specific topics or material types that should be added.

        Return the analysis in strict JSON format:
        {
            "alignmentScore": number,
            "gapAnalysis": "Detailed qualitative analysis string",
            "identifiedGaps": ["Gap 1", "Gap 2"],
            "suggestions": "Brief bulleted suggestions string"
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
        const audit = await prisma.curriculumAudit.create({
            data: {
                courseId,
                academicYear,
                alignmentScore: result.alignmentScore,
                gapAnalysis: result.gapAnalysis,
                identifiedGaps: result.identifiedGaps,
                suggestions: result.suggestions,
                status: 'COMPLETED'
            }
        });

        return audit;
    } catch (error) {
        console.error('Curriculum Alignment AI Error:', error);
        throw error;
    }
};

export const getCourseAlignmentHistory = async (courseId: string) => {
    return prisma.curriculumAudit.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' }
    });
};
