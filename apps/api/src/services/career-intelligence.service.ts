import axios from 'axios';

/**
 * Career Intelligence Service — v1.0.0
 * Orchestrates AI-driven career pathing and growth milestones using local Ollama.
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

export interface CareerAIContext {
    studentName: string;
    program: string;
    semester: number;
    currentSgpa: number;
    attendanceRate: number;
    completedCourses: string[];
}

export const generateCareerIntelligence = async (context: CareerAIContext) => {
    const prompt = `
        System: You are an expert Academic Advisor and Career Coach at a high-tech university.
        Task: Analyze the student's academic profile and provide a strategic career roadmap in JSON format.
        
        Student Context:
        - Name: ${context.studentName}
        - Program: ${context.program}
        - Current Semester: ${context.semester}
        - Academic Standing: SGPA ${context.currentSgpa.toFixed(2)}
        - Engagement: ${context.attendanceRate.toFixed(1)}% attendance
        - Completed Coursework: ${context.completedCourses.join(', ')}

        Constraint: Response MUST be a valid JSON object with the following structure:
        {
            "careerTrack": "Name of recommended track (e.g., Full-Stack, Data Science)",
            "optimalityScore": 0-100 (based on compatibility with grades),
            "skillGap": ["Skill 1", "Skill 2"],
            "nextMilestone": {
                "title": "Immediate goal",
                "difficulty": "Easy/Medium/Hard"
            },
            "growthOrbit": [
                { "phase": "Semester X", "focus": "Description", "badge": "Icon-Name" }
            ]
        }
    `;

    try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json',
            options: {
                temperature: 0.7,
                top_p: 0.9,
                num_predict: 800
            }
        });

        // Ollama returns a top-level JSON with "response" containing the actual stringified JSON
        if (response.data && response.data.response) {
            return JSON.parse(response.data.response);
        }
        
        throw new Error('Invalid response format from AI engine');

    } catch (error: any) {
        console.error('Ollama Generation Failed:', error.message);
        
        // Fallback Mock in case of service failure
        return {
            careerTrack: "Full-Stack Development (Fallback)",
            optimalityScore: 85,
            skillGap: ["Advanced TypeScript", "Docker"],
            nextMilestone: {
                "title": "Complete Cloud Deployment Lab",
                "difficulty": "Medium"
            },
            growthOrbit: [
                { "phase": "Semester 5", "focus": "Systems Architecture", "badge": "target" },
                { "phase": "Semester 6", "focus": "Industry Internship", "badge": "briefcase" }
            ]
        };
    }
};
