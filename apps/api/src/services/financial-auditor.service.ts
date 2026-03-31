import axios from 'axios';

/**
 * Financial Auditor Service — v1.0.0
 * Orchestrates AI-driven financial transparency and scholarship matching using local Ollama.
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

export interface FinancialAIContext {
    studentName: string;
    program: string;
    semester: number;
    currentSgpa: number;
    attendanceRate: number;
    totalPaid: number;
    totalPending: number;
}

export interface FeeStructureExplanation {
    summary: string;
    breakdown: { component: string; explanation: string; importance: 'CRITICAL' | 'STANDARD' | 'OPTIONAL' }[];
    savingsTip: string;
}

export interface GrantMatch {
    scholarshipId: string;
    matchScore: number; // 0-100
    matchingCriteria: string[];
    missingCriteria: string[];
    recommendation: string;
}

/**
 * Explains a fee structure in human terms.
 */
export const explainFeeStructure = async (feeStructure: any, context: FinancialAIContext): Promise<FeeStructureExplanation> => {
    const prompt = `
        System: You are an expert University Financial Auditor and Student Advocate.
        Task: Analyze the provided fee structure and explain it in human-friendly, transparent terms.
        
        Fee Structure Details:
        ${JSON.stringify(feeStructure.components, null, 2)}
        Total Amount: ${feeStructure.totalAmount}

        Student Context:
        - Name: ${context.studentName}
        - Current SGPA: ${context.currentSgpa.toFixed(2)}
        - Attendance: ${context.attendanceRate.toFixed(1)}%

        Constraint: Response MUST be a valid JSON object with:
        {
            "summary": "High-level human summary of this semester's fees",
            "breakdown": [
                { "component": "Name", "explanation": "What this covers in simple terms", "importance": "CRITICAL/STANDARD/OPTIONAL" }
            ],
            "savingsTip": "A tip on how to reduce costs or get value (e.g., using library vs buying books)"
        }
    `;

    try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        if (response.data && response.data.response) {
            return JSON.parse(response.data.response);
        }
        throw new Error('Invalid AI response');
    } catch (error: any) {
        console.error('Financial Audit Analysis Failed:', error.message);
        return {
            summary: "Standard semester tuition and laboratory fees based on your current enrollment.",
            breakdown: Object.keys(feeStructure.components).map(key => ({
                component: key,
                explanation: `Standard institutional fee for ${key}.`,
                importance: 'STANDARD'
            })),
            savingsTip: "Ensure timely payment to avoid late registration penalties."
        };
    }
};

/**
 * Calculates eligibility for a list of scholarships.
 */
export const matchScholarships = async (scholarships: any[], context: FinancialAIContext): Promise<GrantMatch[]> => {
    const prompt = `
        System: You are an AI Scholarship Coordinator.
        Task: Correlate the student's performance with a list of active scholarships.
        
        Student Context:
        - GPA: ${context.currentSgpa.toFixed(2)}
        - Attendance: ${context.attendanceRate.toFixed(1)}%

        Scholarships:
        ${JSON.stringify(scholarships.map(s => ({ id: s.id, name: s.name, minGpa: s.minGpa, backlogs: s.maxBacklogs })), null, 2)}

        Constraint: Response MUST be a valid JSON array of match objects:
        [
            { 
                "scholarshipId": "uuid", 
                "matchScore": 0-100, 
                "matchingCriteria": ["GPA > X", "Attendance > Y"],
                "missingCriteria": ["Wait for Semester 5", etc],
                "recommendation": "One sentence actionable advice"
            }
        ]
    `;

    try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        if (response.data && response.data.response) {
            return JSON.parse(response.data.response);
        }
        throw new Error('Invalid AI response');
    } catch (error: any) {
        console.error('Scholarship Matching Failed:', error.message);
        return [];
    }
};
