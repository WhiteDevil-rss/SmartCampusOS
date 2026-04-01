import prisma from '../lib/prisma';
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export const getFacultyResearchNexus = async (facultyId: string) => {
    const [publications, grants] = await Promise.all([
        prisma.publication.findMany({
            where: { facultyId },
            orderBy: { publicationDate: 'desc' }
        }),
        prisma.researchGrant.findMany({
            where: { facultyId },
            orderBy: { startDate: 'desc' }
        })
    ]);

    const totalCitations = publications.reduce((acc, pub) => acc + pub.citationsCount, 0);
    
    // Simple h-index calculation: 
    // The h-index is defined as the maximum value of h such that the given author/journal 
    // has published h papers that have each been cited at least h times.
    const sortedCitations = publications.map(p => p.citationsCount).sort((a, b) => b - a);
    let hIndex = 0;
    for (let i = 0; i < sortedCitations.length; i++) {
        if (sortedCitations[i] >= i + 1) {
            hIndex = i + 1;
        } else {
            break;
        }
    }

    const activeGrantsTotal = grants
        .filter(g => g.status === 'ACTIVE')
        .reduce((acc, g) => acc + g.amount, 0);

    const researchImpactScore = publications.length > 0 
        ? ((totalCitations / publications.length) * (hIndex / 2)).toFixed(1)
        : 0;

    return {
        publications,
        grants,
        stats: {
            totalPublications: publications.length,
            totalCitations,
            hIndex,
            activeGrantsTotal,
            researchImpactScore
        }
    };
};

export const createPublication = async (facultyId: string, data: any) => {
    return prisma.publication.create({
        data: {
            ...data,
            facultyId,
            publicationDate: new Date(data.publicationDate)
        }
    });
};

export const createGrant = async (facultyId: string, data: any) => {
    return prisma.researchGrant.create({
        data: {
            ...data,
            facultyId,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null
        }
    });
};

export const analyzeResearchImpact = async (abstract: string) => {
    const prompt = `
        As an AI Research Analyst, analyze the following abstract for potential academic impact.
        Provide a JSON response with:
        1. predictedImpactScore (0-100)
        2. suggestedJournals (array of strings)
        3. keyKeywords (array of strings)
        4. improvementSuggestions (string)

        Abstract: "${abstract}"
    `;

    try {
        const response = await axios.post(OLLAMA_URL, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        return JSON.parse(response.data.response);
    } catch (error) {
        console.error('Ollama Analysis Error:', error);
        return {
            predictedImpactScore: 50,
            suggestedJournals: ['General Science Journal'],
            keyKeywords: [],
            improvementSuggestions: 'AI analysis unavailable at this moment.'
        };
    }
};

export const generateFullProposal = async (grantId: string) => {
    const grant = await prisma.researchGrant.findUnique({
        where: { id: grantId },
        include: { faculty: true }
    });

    if (!grant) throw new Error('Grant not found');

    const prompt = `
        As a Senior Grant Writing AI, draft a comprehensive research proposal based on the following details.
        
        Researcher: ${grant.faculty.name}
        Title: ${grant.title}
        Target Agency: ${grant.agency}
        Proposed Budget: $${grant.amount}
        Initial Description: ${grant.description}

        Provide a structured JSON response with the following sections formatted in Markdown:
        1. executiveSummary (200 words)
        2. methodology (Objectives, Research Design, Data Collection)
        3. timeline (Phase 1 to Phase 4)
        4. budgetJustification (itemized allocation for $${grant.amount})
        5. impactStatement (Educational and Social impact)
    `;

    try {
        const response = await axios.post(OLLAMA_URL, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        const proposalData = JSON.parse(response.data.response);
        
        // Construct the full proposalBody string from the JSON sections
        const proposalBody = `
# Research Proposal: ${grant.title}

## Executive Summary
${proposalData.executiveSummary}

## Methodology
${proposalData.methodology}

## Project Timeline
${proposalData.timeline}

## Budget Justification
${proposalData.budgetJustification}

## Impact Statement
${proposalData.impactStatement}
        `.trim();

        return prisma.researchGrant.update({
            where: { id: grantId },
            data: { 
                proposalBody,
                status: 'INTERNAL_REVIEW' 
            }
        });
    } catch (error) {
        console.error('Proposal Generation Error:', error);
        throw error;
    }
};

export const updateGrantStatus = async (grantId: string, status: string, comments?: any) => {
    return prisma.researchGrant.update({
        where: { id: grantId },
        data: { 
            status,
            reviewComments: comments ? comments : undefined
        }
    });
};

export const assignReviewers = async (grantId: string, reviewerIds: string[]) => {
    const reviews = reviewerIds.map(reviewerId => ({
        grantId,
        reviewerId,
        status: 'PENDING'
    }));

    await prisma.researchReview.createMany({
        data: reviews
    });

    return prisma.researchGrant.update({
        where: { id: grantId },
        data: { status: 'INTERNAL_REVIEW' }
    });
};

export const submitReview = async (reviewId: string, facultyId: string, data: { score: number; recommendation: string; comments: string; rubric?: any }) => {
    const review = await prisma.researchReview.findUnique({
        where: { id: reviewId }
    });

    if (!review || review.reviewerId !== facultyId) {
        throw new Error('Unauthorized or review not found');
    }

    return prisma.researchReview.update({
        where: { id: reviewId },
        data: {
            score: data.score,
            recommendation: data.recommendation,
            comments: data.comments,
            rubric: data.rubric || {},
            status: 'COMPLETED'
        }
    });
};

export const getPendingReviews = async (facultyId: string) => {
    return prisma.researchReview.findMany({
        where: { 
            reviewerId: facultyId,
            status: 'PENDING' 
        },
        include: {
            grant: {
                select: {
                    id: true,
                    title: true,
                    agency: true,
                    amount: true,
                    description: true,
                    proposalBody: true
                }
            }
        }
    });
};

export const getGrantFinancials = async (grantId: string) => {
    const grant = await prisma.researchGrant.findUnique({
        where: { id: grantId },
        include: {
            expenditures: true,
            ethicalClearance: true,
            resourceBookings: {
                include: {
                    resource: true
                }
            }
        }
    });

    if (!grant) throw new Error('Grant not found');

    const totalExpended = grant.expenditures.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = grant.amount - totalExpended;
    const burnRate = (totalExpended / grant.amount) * 100;

    const categoryBreakdown = grant.expenditures.reduce((acc: any, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {});

    return {
        grantId: grant.id,
        grantTitle: grant.title,
        totalBudget: grant.amount,
        totalExpended,
        remaining,
        burnRate: Math.round(burnRate),
        expenditures: grant.expenditures,
        categoryBreakdown,
        ethicalStatus: grant.ethicalClearance?.status || 'NOT_STARTED',
        linkedBookings: grant.resourceBookings.map(rb => ({
            id: rb.id,
            resourceName: rb.resource.name,
            startTime: rb.startTime,
            endTime: rb.endTime,
            status: rb.status
        }))
    };
};

export const logExpenditure = async (grantId: string, data: { amount: number; description: string; category: string; date?: string }) => {
    const grant = await prisma.researchGrant.findUnique({
        where: { id: grantId }
    });

    if (!grant) throw new Error('Grant not found');

    // Basic validation: prevent spending over budget (soft warning or hard block? 
    // Usually system should allow logging but flag it)
    return prisma.grantExpenditure.create({
        data: {
            grantId,
            amount: data.amount,
            description: data.description,
            category: data.category,
            date: data.date ? new Date(data.date) : new Date()
        }
    });
};

export const analyzeEthicalRisk = async (grantId: string) => {
    const grant = await prisma.researchGrant.findUnique({
        where: { id: grantId }
    });

    if (!grant || !grant.description) throw new Error('Grant or description missing');

    const prompt = `
        As an Institutional Review Board (IRB) AI Specialist, analyze the following research project for ethical risks.
        Focus on: PII (Personally Identifiable Information), Vulnerable Populations, Informed Consent needs, and Data Privacy.
        
        Project Title: ${grant.title}
        Description: ${grant.description}

        Provide a JSON response with:
        1. riskScore (0-100, where 100 is high risk requiring immediate human oversight)
        2. flaggedConcerns (array of strings)
        3. suggestedMitigations (array of strings)
        4. clearanceRecommendation (string: PENDING, APPROVED, FLAG_FOR_HUMAN_REVIEW)

        Respond ONLY with valid JSON.
    `;

    try {
        const response = await axios.post(OLLAMA_URL, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        const analysis = JSON.parse(response.data.response);

        // Upsert ethical clearance record
        return prisma.ethicalClearance.upsert({
            where: { grantId },
            update: {
                status: analysis.clearanceRecommendation === 'APPROVED' ? 'APPROVED' : 'FLAG_NEED_REVIEW',
                riskScore: analysis.riskScore,
                reviewerNotes: `AI Analysis Flagged: ${analysis.flaggedConcerns.join(', ')}. Suggested Mitigations: ${analysis.suggestedMitigations.join(', ')}`
            },
            create: {
                grantId,
                status: analysis.clearanceRecommendation === 'APPROVED' ? 'APPROVED' : 'FLAG_NEED_REVIEW',
                riskScore: analysis.riskScore,
                reviewerNotes: `AI Analysis Flagged: ${analysis.flaggedConcerns.join(', ')}. Suggested Mitigations: ${analysis.suggestedMitigations.join(', ')}`
            }
        });
    } catch (error) {
        console.error('Ethical Analysis Error:', error);
        throw error;
    }
};

export const getGrantReviews = async (grantId: string) => {
    return prisma.researchReview.findMany({
        where: { grantId },
        select: {
            id: true,
            score: true,
            recommendation: true,
            comments: true,
            status: true,
            isAnonymous: true,
            createdAt: true,
            reviewer: {
                select: {
                    name: true,
                    designation: true
                }
            }
        }
    });
};
