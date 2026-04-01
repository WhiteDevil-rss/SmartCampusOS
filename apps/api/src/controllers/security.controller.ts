import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getAiResponse } from '../services/ai.service';

export class SecurityController {
    // Incidents
    static async getIncidents(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const incidents = await prisma.securityIncident.findMany({
                where: { universityId },
                include: {
                    reportedBy: { select: { username: true, role: true } },
                    assignedTo: { select: { username: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(incidents);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch incidents' });
        }
    }

    static async createIncident(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const { title, description, type, severity, location, reportedById } = req.body;

            // AI Analysis for Priority and Summary
            let aiPriority = 5;
            let aiSummary = "Processing...";

            try {
                const aiAnalysis = await getAiResponse('/security/analyze-incident', { title, description, type });
                if (aiAnalysis) {
                    aiPriority = aiAnalysis.priority || 5;
                    aiSummary = aiAnalysis.summary || "";
                }
            } catch (aiError) {
                console.error('AI Security Analysis failed:', aiError);
            }

            const incident = await prisma.securityIncident.create({
                data: {
                    universityId,
                    title,
                    description,
                    type,
                    severity,
                    location,
                    reportedById,
                    aiPriority,
                    aiSummary
                }
            });

            res.status(201).json(incident);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create incident' });
        }
    }

    static async updateIncident(req: Request, res: Response) {
        try {
            const incidentId = req.params.incidentId as string;
            const updateData = req.body;

            const incident = await prisma.securityIncident.update({
                where: { id: incidentId },
                data: updateData
            });

            res.json(incident);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update incident' });
        }
    }

    // Emergency Alerts
    static async getAlerts(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const alerts = await prisma.emergencyAlert.findMany({
                where: { universityId, isActive: true },
                orderBy: { createdAt: 'desc' }
            });
            res.json(alerts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch alerts' });
        }
    }

    static async createAlert(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const { title, message, scope, type, senderId } = req.body;

            const alert = await prisma.emergencyAlert.create({
                data: {
                    universityId,
                    title,
                    message,
                    scope,
                    type,
                    senderId
                }
            });

            // Trigger Socket/Push notification logic here if needed
            
            res.status(201).json(alert);
        } catch (error) {
            res.status(500).json({ error: 'Failed to trigger emergency alert' });
        }
    }

    // Patrol Routes
    static async getPatrols(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const patrols = await prisma.patrolRoute.findMany({
                where: { universityId },
                include: { officer: { select: { username: true } } }
            });
            res.json(patrols);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch patrols' });
        }
    }

    // Visitor Logs
    static async getVisitors(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const visitors = await prisma.visitorLog.findMany({
                where: { universityId },
                include: { host: { select: { username: true } } },
                orderBy: { checkInTime: 'desc' }
            });
            res.json(visitors);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch visitor logs' });
        }
    }

    static async createVisitor(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            const { visitorName, purpose, hostId, idType, idNumber } = req.body;

            const visitor = await prisma.visitorLog.create({
                data: {
                    universityId,
                    visitorName,
                    purpose,
                    hostId,
                    idType,
                    idNumber
                }
            });

            res.status(201).json(visitor);
        } catch (error) {
            res.status(500).json({ error: 'Failed to log visitor' });
        }
    }

    // Intelligence Hub
    static async getIntelligence(req: Request, res: Response) {
        try {
            const universityId = req.params.universityId as string;
            
            // Aggregated data for AI analysis
            const recentIncidents = await prisma.securityIncident.findMany({
                where: { universityId },
                take: 50,
                orderBy: { createdAt: 'desc' }
            });

            const intelligence = await getAiResponse('/security/generate-intelligence', { incidents: recentIncidents });
            
            res.json(intelligence || { summary: "No critical patterns detected.", status: "SAFE" });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate security intelligence' });
        }
    }
}
