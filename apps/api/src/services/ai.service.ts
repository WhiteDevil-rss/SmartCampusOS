import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000';

export const callAiEngine = async (payload: any) => {
    try {
        const response = await axios.post(`${AI_ENGINE_URL}/solve`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            const data = error.response.data;
            let errMsg = data;

            if (data?.detail && Array.isArray(data.detail)) {
                errMsg = JSON.stringify(data.detail);
            } else if (typeof data === 'object') {
                errMsg = JSON.stringify(data);
            }

            throw new Error(`AI Engine Error: ${errMsg}`);
        }
        throw new Error('Failed to reach AI Engine');
    }
};

export const getAiResponse = async (path: string, data: any) => {
    try {
        const response = await axios.post(`${AI_ENGINE_URL}${path}`, data);
        return response.data;
    } catch (error: any) {
        console.error(`AI Engine Error (${path}):`, error.message);
        return null; // Return null to allow for graceful fallback in controllers
    }
};

export const predictResourceUsage = async (payload: any) => {
    try {
        const response = await axios.post(`${AI_ENGINE_URL}/forecast`, payload);
        return response.data;
    } catch (error: any) {
        console.error('AI Forecast Error:', error.message);
        throw new Error('Failed to fetch resource forecast');
    }
};

export const matchAlumni = async (payload: any) => {
    try {
        const response = await axios.post(`${AI_ENGINE_URL}/match/alumni`, payload);
        return response.data;
    } catch (error: any) {
        console.error('AI Alumni Matching Error:', error.message);
        throw new Error('Failed to fetch alumni matches');
    }
};

export const predictInventoryDepletion = async (payload: any) => {
    try {
        const response = await axios.post(`${AI_ENGINE_URL}/inventory/forecast`, payload);
        return response.data;
    } catch (error: any) {
        console.error('AI Inventory Forecast Error:', error.message);
        throw new Error('Failed to fetch inventory depletion forecast');
    }
};

export const checkAiHealth = async () => {
    try {
        const response = await axios.get(`${AI_ENGINE_URL}/health`, { timeout: 3000 });
        return { ...response.data, reachable: true };
    } catch {
        return { status: 'offline', reachable: false, service: 'ai-engine' };
    }
};
