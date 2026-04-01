import prisma from '../lib/prisma';
import { NotificationService } from './notification.service';

export class MaintenanceService {
    /**
     * Get aggregate health statistics for the campus
     */
    async getCampusHealth(universityId: string) {
        const assets = await prisma.campusAsset.findMany({
            where: { universityId },
            include: { tickets: { where: { status: { not: 'RESOLVED' } } } }
        });

        const total = assets.length;
        const critical = assets.filter(a => a.healthScore < 30 || a.status === 'CRITICAL').length;
        const warning = assets.filter(a => a.healthScore >= 30 && a.healthScore < 70).length;
        const operational = assets.filter(a => a.healthScore >= 70 && a.status === 'OPERATIONAL').length;

        const avgHealth = total > 0 
            ? assets.reduce((acc, curr) => acc + curr.healthScore, 0) / total 
            : 100;

        return {
            total,
            critical,
            warning,
            operational,
            avgHealth: Math.round(avgHealth),
            activeTickets: assets.reduce((acc, curr) => acc + curr.tickets.length, 0)
        };
    }

    /**
     * Fetch all assets with their active tickets
     */
    async getAssets(universityId: string) {
        return prisma.campusAsset.findMany({
            where: { universityId },
            include: {
                tickets: {
                    where: { status: { notIn: ['RESOLVED', 'VERIFIED'] } },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { healthScore: 'asc' }
        });
    }

    /**
     * Trigger a predictive maintenance audit
     * Automatically creates tickets for assets with low health
     */
    async processPredictiveAlerts(universityId: string) {
        const lowHealthAssets = await prisma.campusAsset.findMany({
            where: {
                universityId,
                healthScore: { lt: 40 },
                status: { not: 'MAINTENANCE' }
            },
            include: {
                tickets: {
                    where: { status: { notIn: ['RESOLVED', 'VERIFIED'] } }
                }
            }
        });

        const newTickets = [];

        // Fetch university admins to notify
        const admins = await prisma.user.findMany({
            where: { universityId, role: 'UNI_ADMIN' },
            select: { id: true }
        });

        for (const asset of lowHealthAssets) {
            // Check if a ticket already exists for this asset to avoid duplicates
            if (asset.tickets.length === 0) {
                const severity = asset.healthScore < 15 ? 'CRITICAL' : 'HIGH';
                const ticket = await prisma.maintenanceTicket.create({
                    data: {
                        assetId: asset.id,
                        description: `[AI Predicted Failure] Health dropped to ${asset.healthScore}%. Immediate inspection required for ${asset.type} at ${asset.location}.`,
                        severity,
                        status: 'OPEN',
                        aiPriority: (100 - asset.healthScore) / 10
                    }
                });

                // Notify Admins via Unified Dispatcher
                for (const admin of admins) {
                    await NotificationService.send({
                        userId: admin.id,
                        title: `Critical Alert: ${asset.name}`,
                        message: `Predictive Sentinel detected health drop to ${asset.healthScore}% at ${asset.location}. Ticket #${ticket.id.substring(0, 8)} created.`,
                        category: 'MAINTENANCE',
                        link: `/admin/maintenance`
                    });
                }

                // Update asset status to reflect awareness
                await prisma.campusAsset.update({
                    where: { id: asset.id },
                    data: { status: asset.healthScore < 15 ? 'CRITICAL' : 'WARNING' }
                });

                newTickets.push(ticket);
            }
        }

        return newTickets;
    }

    /**
     * Update asset health and optionally resolve the associated ticket
     */
    async resolveMaintenance(ticketId: string, resolution: string) {
        const ticket = await prisma.maintenanceTicket.update({
            where: { id: ticketId },
            data: {
                status: 'RESOLVED',
                resolution,
                updatedAt: new Date()
            }
        });

        // Restore asset health upon resolution
        await prisma.campusAsset.update({
            where: { id: ticket.assetId },
            data: {
                healthScore: 100,
                status: 'OPERATIONAL',
                lastService: new Date()
            }
        });

        return ticket;
    }

    /**
     * Simulate IoT telemetry for demo purposes
     */
    async simulateTelemetry(assetId: string, dropAmount: number = 25) {
        const asset = await prisma.campusAsset.findUnique({ where: { id: assetId } });
        if (!asset) throw new Error('Asset not found');

        const newHealth = Math.max(0, asset.healthScore - dropAmount);
        
        const updated = await prisma.campusAsset.update({
            where: { id: assetId },
            data: { healthScore: newHealth }
        });

        // Auto-run alert processing
        await this.processPredictiveAlerts(asset.universityId);

        return updated;
    }
}
