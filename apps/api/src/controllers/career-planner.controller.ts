import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Mock generator for AI Roadmap based on Student context.
 * In production, this data comes from an LLM prompt.
 */
const generateRoadmapFromAI = async (programName: string, semester: number, sgpa: number) => {
    // Generate a contextual roadmap
    let track = "General Software Engineering";
    if (programName.toLowerCase().includes('data')) track = "Data Science & MLOps";
    else if (programName.toLowerCase().includes('cloud') || programName.toLowerCase().includes('network')) track = "Cloud Architecture & DevOps";

    // Skill recommendations based on current SGPA and program
    const skills = [
        sgpa > 8 ? "Advanced System Design" : "Core Data Structures",
        "Cloud Deployment (AWS/Azure)",
        "Agile Methodologies",
        track === "Data Science & MLOps" ? "PyTorch/TensorFlow" : "Full-stack Frameworks (React/Node)"
    ];

    return {
        careerTrack: track,
        overview: `Based on your enrollment in the ${programName} program and your current academic standing (SGPA: ${sgpa}), the AI has curated this roadmap. Focus heavily on practical lab sessions and seek out minor electives matching this track.`,
        recommendedSkills: skills,
        roadmap: [
            {
                phase: "Current Semester (Foundations)",
                focus: `Solidify ${skills[0]} and secure a high internal evaluation score to boost SGPA above ${Math.min(10, (sgpa + 1)).toFixed(1)}.`,
                milestone: "Complete 2 mini-projects related to core modules."
            },
            {
                phase: "Next Semester (Specialization)",
                focus: `Begin exploring ${skills[1]} and integrate it with your ${track} track.`,
                milestone: "Achieve Azure Fundamentals or AWS Cloud Practitioner certification."
            },
            {
                phase: "Pre-Final Year (Industry Ready)",
                focus: `Master ${skills[3]} and prepare for summer internships.`,
                milestone: "Deploy a production-grade application and contribute to Open Source."
            },
            {
                phase: "Final Year (Placements)",
                focus: "Aptitude, Mock Interviews, and Major Project Execution.",
                milestone: `Secure a placement offer in a ${track} role.`
            }
        ]
    };
};

export const generateStudyPlan = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.entityId;
        if (!studentId) return res.status(403).json({ error: 'Unauthorized: Student context required' });

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                program: true,
                batch: true,
                results: {
                    orderBy: { semester: 'desc' },
                    take: 1
                }
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const currentSgpa = student.results[0]?.sgpa ? Number(student.results[0].sgpa) : 0;

        // Mocking an AI generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const plan = await generateRoadmapFromAI(student.program.name, student.batch.semester ?? 1, currentSgpa);

        res.json(plan);

    } catch (error) {
        console.error('Failed to generate study plan:', error);
        res.status(500).json({ error: 'Failed to generate study plan' });
    }
};
