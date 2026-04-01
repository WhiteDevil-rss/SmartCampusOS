import prisma from '../lib/prisma';
import { predictInventoryDepletion } from './ai.service';

export class InventoryService {
    static async getItems(universityId: string) {
        return prisma.inventoryItem.findMany({
            where: { universityId },
            orderBy: { name: 'asc' }
        });
    }

    static async getItem(id: string) {
        return prisma.inventoryItem.findUnique({
            where: { id },
            include: { logs: { take: 10, orderBy: { createdAt: 'desc' } } }
        });
    }

    static async createItem(universityId: string, data: any) {
        return prisma.inventoryItem.create({
            data: { ...data, universityId }
        });
    }

    static async updateItem(id: string, data: any) {
        return prisma.inventoryItem.update({
            where: { id },
            data
        });
    }

    static async adjustStock(itemId: string, quantity: number, type: 'IN' | 'OUT', reason: string, userId: string) {
        return prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
            if (!item) throw new Error('Item not found');

            const newLevel = type === 'IN' ? item.stockLevel + quantity : item.stockLevel - quantity;
            
            await tx.stockLog.create({
                data: {
                    itemId,
                    quantity,
                    type,
                    reason,
                    performedById: userId
                }
            });

            return tx.inventoryItem.update({
                where: { id: itemId },
                data: { stockLevel: newLevel }
            });
        });
    }

    static async getVendors(universityId: string) {
        return prisma.vendor.findMany({
            where: { universityId },
            orderBy: { name: 'asc' }
        });
    }

    static async createVendor(universityId: string, data: any) {
        return prisma.vendor.create({
            data: { ...data, universityId }
        });
    }

    static async getProcurementRequests(universityId: string) {
        return prisma.procurementRequest.findMany({
            where: { universityId },
            include: { item: true, vendor: true, requestedBy: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async createProcurementRequest(universityId: string, requestedById: string, data: any) {
        return prisma.procurementRequest.create({
            data: {
                ...data,
                universityId,
                requestedById
            }
        });
    }

    static async updateProcurementStatus(id: string, status: string, userId: string) {
        return prisma.$transaction(async (tx) => {
            const req = await tx.procurementRequest.findUnique({ 
                where: { id },
                include: { item: true }
            });
            if (!req) throw new Error('Request not found');

            const updateData: any = { status };
            if (status === 'APPROVED') updateData.approvedById = userId;

            const updated = await tx.procurementRequest.update({
                where: { id },
                data: updateData
            });

            // If received, update inventory stock automatically
            if (status === 'RECEIVED') {
                await tx.inventoryItem.update({
                    where: { id: req.itemId },
                    data: { stockLevel: { increment: req.quantity } }
                });

                await tx.stockLog.create({
                    data: {
                        itemId: req.itemId,
                        quantity: req.quantity,
                        type: 'IN',
                        reason: `Procurement received: ${req.id}`,
                        performedById: userId
                    }
                });
            }

            return updated;
        });
    }

    static async getForecast(universityId: string) {
        const items = await prisma.inventoryItem.findMany({ where: { universityId } });
        const history = await prisma.stockLog.findMany({
            where: { item: { universityId }, type: 'OUT' },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        const payload = {
            items: items.map(i => ({
                id: i.id,
                name: i.name,
                category: i.category,
                currentStock: i.stockLevel,
                minThreshold: i.minThreshold,
                unit: i.unit
            })),
            usageHistory: history.map(h => ({
                itemId: h.itemId,
                quantity: h.quantity,
                timestamp: h.createdAt.toISOString(),
                type: h.type
            }))
        };

        return predictInventoryDepletion(payload);
    }
}
