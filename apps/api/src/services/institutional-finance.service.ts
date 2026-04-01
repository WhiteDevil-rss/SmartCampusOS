import prisma from '../lib/prisma';
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * Institutional Finance Service — Phase 24
 * Manages university-wide budget health, research grant inflows, and AI-driven auditing.
 */

export const getInstitutionalFinancialOverview = async (universityId: string) => {
    // 1. Fetch all departments with their current active budget and linked faculty research grants
    const departments = await prisma.department.findMany({
        where: { universityId }, // Added universityId filtering
        include: {
            budgets: {
                where: { status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            faculty: {
                include: {
                    faculty: {
                        include: {
                            grants: {
                                include: { expenditures: true }
                            }
                        }
                    }
                }
            }
        }
    });

    // 2. Aggregate financial data per department
    const overview = departments.map(dept => {
        const activeBudget = dept.budgets[0];
        let totalResearchInflow = 0;
        let totalResearchSpent = 0;

        dept.faculty.forEach((fd: any) => {
            if (fd.faculty && fd.faculty.grants) {
                fd.faculty.grants.forEach((grant: any) => {
                    totalResearchInflow += grant.amount;
                    if (grant.expenditures) {
                        totalResearchSpent += grant.expenditures.reduce((sum: number, exp: any) => sum + exp.amount, 0);
                    }
                });
            }
        });

        return {
            departmentId: dept.id,
            departmentName: dept.name,
            budgetAllocation: activeBudget?.totalAllocation || 0,
            operationalSpending: activeBudget?.currentSpending || 0,
            researchInflow: totalResearchInflow,
            researchSpent: totalResearchSpent,
            totalHealthScore: calculateHealthScore(activeBudget, totalResearchInflow, totalResearchSpent)
        };
    });

    return overview;
};

export const auditExpenditure = async (expenditureId: string) => {
    const expenditure = await prisma.grantExpenditure.findUnique({
        where: { id: expenditureId },
        include: {
            grant: {
                include: {
                    faculty: {
                        include: {
                            departments: { take: 1 }
                        }
                    }
                }
            }
        }
    });

    if (!expenditure) throw new Error('Expenditure not found');
    const deptId = expenditure.grant.faculty.departments[0]?.departmentId || '';

    const prompt = `
        System: You are an Institutional Financial Auditor for a High-Tech University.
        Task: Review the following research expenditure for anomalies, regulatory compliance, or misaligned spending.
        
        Expenditure Details:
        - Amount: $${expenditure.amount}
        - Category: ${expenditure.category}
        - Description: ${expenditure.description}
        - Grant Title: ${expenditure.grant.title}
        - Researcher: ${expenditure.grant.faculty.name}

        Constraint: Response MUST be a valid JSON object:
        {
            "riskScore": 0-100,
            "riskReason": "Detailed explanation of why this is flagged or why it is clean.",
            "requiresHumanReview": true/false
        }
    `;

    try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        const aiResult = JSON.parse(response.data.response);

        // 3. Log the audit results in the institutional auditor table
        const auditLog = await prisma.budgetAuditLog.create({
            data: {
                departmentId: deptId,
                expenditureId: expenditure.id,
                amount: expenditure.amount,
                category: expenditure.category,
                riskScore: aiResult.riskScore,
                riskReason: aiResult.riskReason,
                status: aiResult.riskScore > 75 ? 'PENDING_REVIEW' : 'CLEARED'
            }
        });

        return auditLog;
    } catch (error) {
        console.error('Cross-Institutional Audit Failed:', error);
        return null;
    }
};

const calculateHealthScore = (budget: any, inflow: number, spent: number) => {
    if (!budget) return 50; 
    
    const opRatio = budget.currentSpending / budget.totalAllocation;
    const resRatio = inflow > 0 ? spent / inflow : 0;
    
    // Balanced Score: 100 is healthy, 0 is critical
    let score = 100 - (opRatio * 40) - (resRatio * 10);
    if (opRatio > 0.95) score -= 20; // Critical overhead
    
    return Math.max(0, Math.min(100, Math.round(score)));
};
