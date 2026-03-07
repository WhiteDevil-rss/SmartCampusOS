import { PrismaClient } from '../src/generated/client';
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
            platformName: 'SmartCampus OS',
            supportEmail: 'support@smartcampus-os.tech',
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

    // 11. Programs
    if (data.programs) {
        console.log(`Seeding ${data.programs.length} Programs...`);
        for (const prog of data.programs) {
            await prisma.program.upsert({
                where: { id: prog.id },
                update: { name: prog.name, shortName: prog.shortName, type: prog.type, duration: prog.duration, totalSems: prog.totalSems, universityId: prog.universityId, departmentId: prog.departmentId },
                create: { id: prog.id, name: prog.name, shortName: prog.shortName, type: prog.type, duration: prog.duration, totalSems: prog.totalSems, universityId: prog.universityId, departmentId: prog.departmentId },
            });
        }
    }

    // 12. Session Types
    if (data.sessionTypes) {
        console.log(`Seeding ${data.sessionTypes.length} Session Types...`);
        for (const st of data.sessionTypes) {
            await prisma.sessionType.upsert({
                where: { id: st.id },
                update: { name: st.name, durationRule: st.durationRule, roomTypeRequired: st.roomTypeRequired, departmentId: st.departmentId },
                create: { id: st.id, name: st.name, durationRule: st.durationRule, roomTypeRequired: st.roomTypeRequired, departmentId: st.departmentId },
            });
        }
    }

    // 13. Time Blocks
    if (data.timeBlocks) {
        console.log(`Seeding ${data.timeBlocks.length} Time Blocks...`);
        for (const tb of data.timeBlocks) {
            await prisma.timeBlock.upsert({
                where: { id: tb.id },
                update: { name: tb.name, startTime: tb.startTime, endTime: tb.endTime, duration: tb.duration, isBreak: tb.isBreak, slotNumber: tb.slotNumber, departmentId: tb.departmentId },
                create: { id: tb.id, name: tb.name, startTime: tb.startTime, endTime: tb.endTime, duration: tb.duration, isBreak: tb.isBreak, slotNumber: tb.slotNumber, departmentId: tb.departmentId },
            });
        }
    }

    // 14. Students
    if (data.students) {
        console.log(`Seeding ${data.students.length} Students...`);
        for (const st of data.students) {
            await prisma.student.upsert({
                where: { id: st.id },
                update: { enrollmentNo: st.enrollmentNo, name: st.name, email: st.email, phone: st.phone, batchId: st.batchId, programId: st.programId, admissionYear: st.admissionYear, universityId: st.universityId, departmentId: st.departmentId },
                create: { id: st.id, enrollmentNo: st.enrollmentNo, name: st.name, email: st.email, phone: st.phone, batchId: st.batchId, programId: st.programId, admissionYear: st.admissionYear, universityId: st.universityId, departmentId: st.departmentId },
            });
        }
    }

    // 15. Assignments
    if (data.assignments) {
        console.log(`Seeding ${data.assignments.length} Assignments...`);
        for (const asm of data.assignments) {
            await prisma.assignment.upsert({
                where: { id: asm.id },
                update: { title: asm.title, description: asm.description, dueDate: asm.dueDate, maxMarks: asm.maxMarks, facultyId: asm.facultyId, courseId: asm.courseId, batchId: asm.batchId },
                create: { id: asm.id, title: asm.title, description: asm.description, dueDate: asm.dueDate, maxMarks: asm.maxMarks, facultyId: asm.facultyId, courseId: asm.courseId, batchId: asm.batchId },
            });
        }
    }

    // 16. Fee Structures
    if (data.feeStructures) {
        console.log(`Seeding ${data.feeStructures.length} Fee Structures...`);
        for (const fs of data.feeStructures) {
            await prisma.feeStructure.upsert({
                where: { id: fs.id },
                update: { semester: fs.semester, academicYear: fs.academicYear, components: fs.components, totalAmount: fs.totalAmount, universityId: fs.universityId, programId: fs.programId },
                create: { id: fs.id, semester: fs.semester, academicYear: fs.academicYear, components: fs.components, totalAmount: fs.totalAmount, universityId: fs.universityId, programId: fs.programId },
            });
        }
    }

    // 17. Permissions (SuperAdmin)
    const superAdminId = '9be572c4-1fc9-48c3-9b30-631316853799';
    const modules = ['USERS', 'UNIVERSITIES', 'DEPARTMENTS', 'COURSES', 'STUDENTS', 'FACULTY', 'INQUIRIES', 'SUBSCRIBERS', 'NOTIFICATIONS', 'SETTINGS'];

    console.log('Seeding SuperAdmin Permissions...');
    for (const module of modules) {
        await prisma.permission.upsert({
            where: {
                // Since we don't have a unique constraint on (userId, module, action) yet in schema
                // we'll use a find-then-create approach or just use a stable ID for seeding
                id: `perm-superadmin-${module.toLowerCase()}-all`,
            },
            update: {
                allowed: true,
                action: 'ALL',
            },
            create: {
                id: `perm-superadmin-${module.toLowerCase()}-all`,
                userId: superAdminId,
                roleId: 'SUPERADMIN',
                module: module,
                action: 'ALL',
                allowed: true,
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
