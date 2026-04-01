import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();
const universityId = 'b76a8c7f-698a-489c-9e8e-a4c86b4bbe83';

async function main() {
    console.log('🌱 Seeding Campus Assets...');

    const assets = [
        { name: 'Central HVAC - Library', type: 'HVAC', location: 'Building A, Floor 0', healthScore: 92 },
        { name: 'Elevator #1 - Admin Block', type: 'ELEVATOR', location: 'Admin Block', healthScore: 88 },
        { name: 'Main Water Pump', type: 'WATER_PUMP', location: 'Utility Yard', healthScore: 35 }, // Warning
        { name: 'Smart Lighting Grid - CS Dept', type: 'LIGHTING', location: 'Building B, Floor 2', healthScore: 98 },
        { name: 'HVAC Unit 4 - Boys Hostel', type: 'HVAC', location: 'Hostel C', healthScore: 12 }, // Critical
        { name: 'Elevator #2 - Library', type: 'ELEVATOR', location: 'Building A', healthScore: 75 },
        { name: 'Solar Array Controller', type: 'SENSOR', location: 'Rooftop, Building B', healthScore: 95 },
        { name: 'Smart Meter - Academic G Block', type: 'SENSOR', location: 'Academic G', healthScore: 100 },
        { name: 'Fire Suppression System', type: 'SAFETY', location: 'Chemical Lab', healthScore: 99 },
        { name: 'Backup Generator', type: 'POWER', location: 'Main Substation', healthScore: 82 },
    ];

    for (const data of assets) {
        const asset = await prisma.campusAsset.upsert({
            where: { iotDeviceId: `IOT-${data.name.replace(/\s+/g, '-')}` },
            update: {
                healthScore: data.healthScore,
                status: data.healthScore < 20 ? 'CRITICAL' : data.healthScore < 50 ? 'WARNING' : 'OPERATIONAL'
            },
            create: {
                universityId,
                name: data.name,
                type: data.type,
                location: data.location,
                healthScore: data.healthScore,
                status: data.healthScore < 20 ? 'CRITICAL' : data.healthScore < 50 ? 'WARNING' : 'OPERATIONAL',
                iotDeviceId: `IOT-${data.name.replace(/\s+/g, '-')}`,
                nextService: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        // Auto-create tickets for problematic assets
        if (data.healthScore < 40) {
            await prisma.maintenanceTicket.create({
                data: {
                    assetId: asset.id,
                    description: `[Seed] Auto-generated repair ticket for ${asset.name}. Predictive failure detected.`,
                    severity: data.healthScore < 20 ? 'CRITICAL' : 'HIGH',
                    status: 'OPEN',
                    aiPriority: (100 - data.healthScore) / 10
                }
            });
        }
    }

    console.log('✅ Maintenance Seeding Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
