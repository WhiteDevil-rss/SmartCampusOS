import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

interface RiskContext {
    attendanceRate: number;
    attendanceTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
    sgpaHistory: number[];
    assignmentEngagement: number; // Percentage of assignments submitted
    quizPerformance: number; // Average quiz score
}

export const analyzeStudentRisk = async (context: RiskContext) => {
    const prompt = `
        Analyze the academic risk for a student based on the following longitudinal data:
        - Attendance Rate: ${context.attendanceRate}%
        - Attendance Trend: ${context.attendanceTrend}
        - SGPA History (Latest to Oldest): ${context.sgpaHistory.join(', ')}
        - Assignment Submission Rate: ${context.assignmentEngagement}%
        - Avg Quiz Score: ${context.quizPerformance}%

        Assess the risk level (SAFE, AT_RISK, CRITICAL) and provide a numerical score (0-100, where 100 is maximum risk).
        Identify exactly 3 primary risk factors or momentum indicators.
        Suggest 2 personalized academic interventions.

        Return ONLY a JSON object in this format:
        {
            "riskLevel": "CRITICAL" | "AT_RISK" | "SAFE",
            "score": number,
            "factors": [
                { "label": "string", "impact": "POSITIVE" | "NEGATIVE", "description": "string" }
            ],
            "recommendations": [
                { "title": "string", "description": "string", "type": "TUTORIAL" | "COUNSELING" | "RESOURCE" }
            ]
        }
    `;

    try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        const result = JSON.parse(response.data.response);
        return result;
    } catch (error: any) {
        console.error('AI Risk Analysis Error:', error.message);
        // Fallback logic if AI is offline
        const basicScore = (100 - context.attendanceRate) * 0.5 + (10 - (context.sgpaHistory[0] || 7)) * 5;
        return {
            riskLevel: basicScore > 60 ? 'CRITICAL' : basicScore > 30 ? 'AT_RISK' : 'SAFE',
            score: Math.min(100, Math.max(0, Math.round(basicScore))),
            factors: [{ label: 'System Analytics', impact: 'NEGATIVE', description: 'AI Engine offline. Basic heuristic used.' }],
            recommendations: [{ title: 'Academic Review', description: 'Schedule a check-in with your advisor.', type: 'COUNSELING' }]
        };
    }
};
