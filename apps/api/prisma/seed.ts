import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { firebaseAdmin } from '../src/lib/firebase-admin';

const prisma = new PrismaClient();

async function syncFirebaseUser(email: string, password: string, displayName: string): Promise<string> {
    try {
        const user = await firebaseAdmin.auth().createUser({
            email,
            password,
            displayName,
        });
        return user.uid;
    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            const user = await firebaseAdmin.auth().getUserByEmail(email);
            // Ensure password is reset to 'password123' for ease of use in demo environments
            await firebaseAdmin.auth().updateUser(user.uid, { password, displayName });
            return user.uid;
        }
        throw error;
    }
}

async function main() {
    console.log('Seeding from seed-data.json... Syncing with Firebase!');

    const dataPath = path.join(__dirname, 'seed-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    // Hash standard password for seed users
    const standardPassword = 'password123';
    const passwordHash = await bcrypt.hash(standardPassword, 12);

    // 1. Global Settings (Not in JSON, keeping from previous seed)
    console.log('Initializing Global Settings...');
    await prisma.globalSettings.upsert({
        where: { id: 'system-config' },
        update: {},
        create: {
            id: 'system-config',
            platformName: 'Zembaa.AI Scheduler',
            supportEmail: 'support@zembaa.ai',
            maintenanceMode: false,
            sessionTimeout: 600,
            mfaEnabled: false,
            logRetention: '30',
            autoBackups: false,
        },
    });

    // 2. Universities
    console.log(`Seeding ${data.universities.length} Universities...`);
    for (const uni of data.universities) {
        await prisma.university.upsert({
            where: { id: uni.id },
            update: {
                name: uni.name,
                shortName: uni.shortName,
                location: uni.location,
                email: uni.email,
                estYear: uni.estYear,
                website: uni.website,
            },
            create: {
                id: uni.id,
                name: uni.name,
                shortName: uni.shortName,
                location: uni.location,
                email: uni.email,
                estYear: uni.estYear,
                website: uni.website,
            },
        });
    }

    // 3. Users
    console.log(`Seeding ${data.users.length} Users...`);
    for (const user of data.users) {
        // Sync with Firebase
        const fUid = await syncFirebaseUser(user.email, standardPassword, user.username);

        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                username: user.username,
                email: user.email,
                passwordHash: user.passwordHash || passwordHash,
                firebaseUid: fUid,
                role: user.role,
                universityId: user.universityId,
                entityId: user.entityId,
                isActive: user.isActive,
            },
            create: {
                id: user.id,
                username: user.username,
                email: user.email,
                passwordHash: user.passwordHash || passwordHash,
                firebaseUid: fUid,
                role: user.role,
                universityId: user.universityId,
                entityId: user.entityId,
                isActive: user.isActive,
            },
        });
    }

    // Update University adminUserId
    for (const uni of data.universities) {
        if (uni.adminUserId) {
            await prisma.university.update({
                where: { id: uni.id },
                data: { adminUserId: uni.adminUserId },
            });
        }
    }

    // 4. Departments
    console.log(`Seeding ${data.departments.length} Departments...`);
    for (const dept of data.departments) {
        await prisma.department.upsert({
            where: { id: dept.id },
            update: {
                name: dept.name,
                shortName: dept.shortName,
                hod: dept.hod,
                email: dept.email,
                universityId: dept.universityId,
                adminUserId: dept.adminUserId,
            },
            create: {
                id: dept.id,
                name: dept.name,
                shortName: dept.shortName,
                hod: dept.hod,
                email: dept.email,
                universityId: dept.universityId,
                adminUserId: dept.adminUserId,
            },
        });
    }

    // 5. Resources
    console.log(`Seeding ${data.resources.length} Resources...`);
    for (const res of data.resources) {
        await prisma.resource.upsert({
            where: { id: res.id },
            update: {
                name: res.name,
                type: res.type,
                capacity: res.capacity,
                floor: res.floor,
                building: res.building,
                universityId: res.universityId,
            },
            create: {
                id: res.id,
                name: res.name,
                type: res.type,
                capacity: res.capacity,
                floor: res.floor,
                building: res.building,
                universityId: res.universityId,
            },
        });
    }

    // 6. Batches
    console.log(`Seeding ${data.batches.length} Batches...`);
    for (const batch of data.batches) {
        await prisma.batch.upsert({
            where: { id: batch.id },
            update: {
                name: batch.name,
                program: batch.program,
                semester: batch.semester,
                division: batch.division,
                year: batch.year,
                strength: batch.strength,
                totalStudents: batch.totalStudents,
                universityId: batch.universityId,
                departmentId: batch.departmentId,
            },
            create: {
                id: batch.id,
                name: batch.name,
                program: batch.program,
                semester: batch.semester,
                division: batch.division,
                year: batch.year,
                strength: batch.strength,
                totalStudents: batch.totalStudents,
                universityId: batch.universityId,
                departmentId: batch.departmentId,
            },
        });
    }

    // 7. Courses
    console.log(`Seeding ${data.courses.length} Courses...`);
    for (const course of data.courses) {
        await prisma.course.upsert({
            where: { id: course.id },
            update: {
                name: course.name,
                code: course.code,
                program: course.program,
                credits: course.credits,
                weeklyHrs: course.weeklyHrs,
                semester: course.semester,
                type: course.type,
                labDuration: course.labDuration,
                isElective: course.isElective,
                universityId: course.universityId,
                departmentId: course.departmentId,
            },
            create: {
                id: course.id,
                name: course.name,
                code: course.code,
                program: course.program,
                credits: course.credits,
                weeklyHrs: course.weeklyHrs,
                semester: course.semester,
                type: course.type,
                labDuration: course.labDuration,
                isElective: course.isElective,
                universityId: course.universityId,
                departmentId: course.departmentId,
            },
        });
    }

    // 8. Faculty
    console.log(`Seeding ${data.faculty.length} Faculty Members...`);
    for (const fac of data.faculty) {
        await prisma.faculty.upsert({
            where: { id: fac.id },
            update: {
                name: fac.name,
                email: fac.email,
                phone: fac.phone,
                designation: fac.designation,
                qualifications: fac.qualifications,
                experience: fac.experience,
                userId: fac.userId,
                universityId: fac.universityId,
            },
            create: {
                id: fac.id,
                name: fac.name,
                email: fac.email,
                phone: fac.phone,
                designation: fac.designation,
                qualifications: fac.qualifications,
                experience: fac.experience,
                userId: fac.userId,
                universityId: fac.universityId,
            },
        });
    }

    // 9. Faculty-Department Mapping
    console.log(`Seeding ${data.facultyDepartments.length} Faculty-Department Mappings...`);
    for (const fd of data.facultyDepartments) {
        await prisma.facultyDepartment.upsert({
            where: {
                facultyId_departmentId: {
                    facultyId: fd.facultyId,
                    departmentId: fd.departmentId,
                },
            },
            update: {},
            create: {
                facultyId: fd.facultyId,
                departmentId: fd.departmentId,
            },
        });
    }

    // 10. Faculty-Subject Mapping
    console.log(`Seeding ${data.facultySubjects.length} Faculty-Subject Mappings...`);
    for (const fs of data.facultySubjects) {
        await prisma.facultySubject.upsert({
            where: { id: fs.id },
            update: {
                facultyId: fs.facultyId,
                courseId: fs.courseId,
                isPrimary: fs.isPrimary,
                proficiencyLevel: fs.proficiencyLevel,
            },
            create: {
                id: fs.id,
                facultyId: fs.facultyId,
                courseId: fs.courseId,
                isPrimary: fs.isPrimary,
                proficiencyLevel: fs.proficiencyLevel,
            },
        });
    }

    console.log('Seeding Complete! 🎉');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
