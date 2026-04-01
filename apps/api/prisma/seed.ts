import { PrismaClient, Prisma } from '../src/generated/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { firebaseAdmin } from '../src/lib/firebase-admin';

const prisma = new PrismaClient();

async function tableExists(tableName: string) {
    const result = await prisma.$queryRaw<Array<{ name: string | null }>>(
        Prisma.sql`SELECT to_regclass(${tableName})::text AS name`
    );
    return Boolean(result[0]?.name);
}

async function seedIfTableExists<T>(
    tableName: string,
    message: string,
    fn: () => Promise<T>
) {
    const available = await tableExists(tableName);
    if (!available) {
        console.log(`Skipping ${message} because table "${tableName}" is not available in this database.`);
        return null;
    }

    return fn();
}

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
        update: {
            platformName: 'SmartCampus OS',
            supportEmail: 'support@smartcampus-os.tech',
            maintenanceMode: false,
            sessionTimeout: 10,
            sessionWarningMinutes: 2,
            loginAttemptLimit: 5,
            lockoutDurationMinutes: 15,
            mfaEnabled: false,
            logRetention: '30',
            autoBackups: false,
        },
        create: {
            id: 'system-config',
            platformName: 'SmartCampus OS',
            supportEmail: 'support@smartcampus-os.tech',
            maintenanceMode: false,
            sessionTimeout: 10,
            sessionWarningMinutes: 2,
            loginAttemptLimit: 5,
            lockoutDurationMinutes: 15,
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
        const defaults = {
            status: res.status ?? 'AVAILABLE',
            isResearchOnly: res.isResearchOnly ?? false,
            specifications: res.specifications ?? {},
            requiresApproval: res.requiresApproval ?? false,
        };

        await prisma.resource.upsert({
            where: { id: res.id },
            update: {
                name: res.name,
                type: res.type,
                capacity: res.capacity,
                floor: res.floor,
                building: res.building,
                universityId: res.universityId,
                ...defaults,
            },
            create: {
                id: res.id,
                name: res.name,
                type: res.type,
                capacity: res.capacity,
                floor: res.floor,
                building: res.building,
                universityId: res.universityId,
                ...defaults,
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
                year: batch.year,
                universityId: batch.universityId,
                departmentId: batch.departmentId,
            },
            create: {
                id: batch.id,
                name: batch.name,
                program: batch.program,
                semester: batch.semester,
                year: batch.year,
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

    const ensureStudentUser = async (student: any) => {
        const targetUserId = student.userId || student.id;
        const userName = `${student.name.split(' ')[0].toLowerCase()}_${targetUserId.slice(0, 6)}`;
        let email = student.email || `${userName}@student.example.edu`;
        if (student.email) {
            const existing = await prisma.user.findFirst({ where: { email: student.email } });
            if (!existing) {
                // use given email
            } else if (existing.id !== targetUserId) {
                email = `${userName}+${targetUserId.slice(0, 4)}@student.example.edu`;
            }
        }
        const uniqueEmail = student.email ? email : `${userName}+${targetUserId.slice(0, 4)}@student.example.edu`;
        email = uniqueEmail;
        await prisma.user.upsert({
            where: { id: targetUserId },
            update: {
                username: userName,
                email,
                passwordHash,
                role: 'STUDENT',
                universityId: student.universityId,
                entityId: student.departmentId,
                isActive: true,
            },
            create: {
                id: targetUserId,
                username: userName,
                email,
                passwordHash,
                role: 'STUDENT',
                universityId: student.universityId,
                entityId: student.departmentId,
                isActive: true,
            },
        });
        return targetUserId;
    };

    // 14. Students
    if (data.students) {
        console.log(`Seeding ${data.students.length} Students...`);
        for (const st of data.students) {
            const resolvedUserId = await ensureStudentUser(st);
            const basePayload = {
                enrollmentNo: st.enrollmentNo,
                name: st.name,
                email: st.email,
                phone: st.phone,
                batchId: st.batchId,
                programId: st.programId,
                admissionYear: st.admissionYear,
                universityId: st.universityId,
                departmentId: st.departmentId,
                userId: resolvedUserId,
            };
            await prisma.student.upsert({
                where: { id: st.id },
                update: basePayload,
                create: { id: st.id, ...basePayload },
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

    // 17. Books
    if (data.books) {
        console.log(`Seeding ${data.books.length} Books...`);
        for (const book of data.books) {
            await prisma.book.upsert({
                where: { id: book.id },
                update: { isbn: book.isbn, title: book.title, author: book.author, category: book.category, totalCopies: book.totalCopies, availableCopies: book.availableCopies, universityId: book.universityId, departmentId: book.departmentId || null },
                create: { id: book.id, isbn: book.isbn, title: book.title, author: book.author, category: book.category, totalCopies: book.totalCopies, availableCopies: book.availableCopies, universityId: book.universityId, departmentId: book.departmentId || null },
            });
        }
    }

    // 18. Book Loans
    if (data.bookLoans) {
        console.log(`Seeding ${data.bookLoans.length} Book Loans...`);
        for (const loan of data.bookLoans) {
            await prisma.bookLoan.upsert({
                where: { id: loan.id },
                update: { studentId: loan.studentId, bookId: loan.bookId, issuedAt: new Date(loan.issuedAt), dueDate: new Date(loan.dueDate), returnedAt: loan.returnedAt ? new Date(loan.returnedAt) : null, fineAmount: loan.fineAmount },
                create: { id: loan.id, studentId: loan.studentId, bookId: loan.bookId, issuedAt: new Date(loan.issuedAt), dueDate: new Date(loan.dueDate), returnedAt: loan.returnedAt ? new Date(loan.returnedAt) : null, fineAmount: loan.fineAmount },
            });
        }
    }

    // 19. Companies
    if (data.companies) {
        console.log(`Seeding ${data.companies.length} Companies...`);
        for (const company of data.companies) {
            await prisma.company.upsert({
                where: { id: company.id },
                update: { name: company.name, type: company.type, website: company.website, hrContact: company.hrContact, universityId: company.universityId },
                create: { id: company.id, name: company.name, type: company.type, website: company.website, hrContact: company.hrContact, universityId: company.universityId },
            });
        }
    }

    // 20. Placement Records
    if (data.placementRecords) {
        console.log(`Seeding ${data.placementRecords.length} Placement Records...`);
        for (const pr of data.placementRecords) {
            await prisma.placementRecord.upsert({
                where: { id: pr.id },
                update: { studentId: pr.studentId, companyId: pr.companyId, placedAt: new Date(pr.placedAt), ctc: pr.ctc, role: pr.role },
                create: { id: pr.id, studentId: pr.studentId, companyId: pr.companyId, placedAt: new Date(pr.placedAt), ctc: pr.ctc, role: pr.role },
            });
        }
    }

    // 20.5 Seed Demo Results & Admissions for SaaS Verify Page Testing
    await seedIfTableExists('results', 'demo results and verification hashes', async () => {
        console.log('Seeding Results & Verification Hashes...');
        const demoStudents = data.students ? data.students.slice(0, 5) : [];
        const admissionsAvailable = await tableExists('admission_applications');
        const subjectResultsAvailable = await tableExists('subject_results');

        // Fixed SGPA/CGPA for the first 5 students to ensure deterministic hashes for docs and QA
        const deterministicResults = [
            { sgpa: 8.50, cgpa: 8.25 },
            { sgpa: 9.20, cgpa: 9.10 },
            { sgpa: 7.80, cgpa: 7.95 },
            { sgpa: 8.85, cgpa: 8.70 },
            { sgpa: 9.50, cgpa: 9.45 }
        ];

        for (let i = 0; i < demoStudents.length; i++) {
            const student = demoStudents[i];
            const deterministic = deterministicResults[i] || deterministicResults[deterministicResults.length - 1];

            const applicationHashString = `${student.enrollmentNo}:${student.email}:${student.id}:ADMIT_SECURE`;
            const admitHash = crypto.createHash('sha256').update(applicationHashString).digest('hex');

            if (admissionsAvailable) {
                await prisma.admissionApplication.upsert({
                    where: { id: student.id },
                    update: {
                        applicationId: `ADM-2025-${student.id.substring(0, 8).toUpperCase()}`,
                        universityId: student.universityId,
                        departmentId: student.departmentId,
                        programId: student.programId,
                        applicantName: student.name,
                        email: student.email,
                        phone: student.phone || '9999999999',
                        documents: {},
                        status: 'APPROVED',
                        remarks: 'Verified by SmartCampus OS Seed',
                    },
                    create: {
                        id: student.id,
                        applicationId: `ADM-2025-${student.id.substring(0, 8).toUpperCase()}`,
                        universityId: student.universityId,
                        departmentId: student.departmentId,
                        programId: student.programId,
                        applicantName: student.name,
                        email: student.email,
                        phone: student.phone || '9999999999',
                        documents: {},
                        status: 'APPROVED',
                        remarks: 'Verified by SmartCampus OS Seed',
                    }
                });
            }

            console.log(`\n🔑 Demo Admission Verify Hash for ${student.name} (${student.enrollmentNo}):\n   ${admitHash}`);

            const semester = 2;
            const programCourses = data.courses
                .filter((course: any) => course.program === student.programId || course.semester === semester)
                .slice(0, 5);
            const fallbackCourses = data.courses.slice(0, 5);
            const selectedCourses = programCourses.length > 0 ? programCourses : fallbackCourses;

            const subjectResultsData = selectedCourses.map((course: any, index: number) => {
                const gradeTemplates = [
                    { internal: 24, external: 62, total: 86, grade: 'A+', points: 9 },
                    { internal: 22, external: 58, total: 80, grade: 'A+', points: 9 },
                    { internal: 21, external: 54, total: 75, grade: 'A', points: 8 },
                    { internal: 20, external: 49, total: 69, grade: 'B+', points: 7 },
                    { internal: 19, external: 46, total: 65, grade: 'B+', points: 7 },
                ];
                const template = gradeTemplates[index % gradeTemplates.length];
                return {
                    courseId: course.id,
                    internalMarks: template.internal,
                    externalMarks: template.external,
                    totalMarks: template.total,
                    grade: template.grade,
                    creditsEarned: course.credits,
                    points: template.points,
                };
            });

            const totalCredits = subjectResultsData.reduce((sum: number, sr: any) => sum + sr.creditsEarned, 0);
            const derivedSgpa = totalCredits > 0
                ? subjectResultsData.reduce((sum: number, sr: any) => sum + (sr.points * sr.creditsEarned), 0) / totalCredits
                : deterministic.sgpa;
            const sgpa = deterministic.sgpa;
            const cgpa = deterministic.cgpa;

            const resultString = `${student.enrollmentNo}:${sgpa.toFixed(2)}:${cgpa.toFixed(2)}`;
            const resultHash = crypto.createHash('sha256').update(resultString).digest('hex');
            const txHash = `0x${crypto.createHash('sha256').update(student.enrollmentNo + '_TX_SECURE').digest('hex')}`;

            const resultRecord = await prisma.result.upsert({
                where: { id: student.id + '-res' },
                update: {
                    studentId: student.id,
                    programId: student.programId,
                    semester,
                    academicYear: '2025-26',
                    sgpa,
                    cgpa,
                    status: 'PASS',
                    resultHash,
                    blockchainTxHash: txHash,
                    publishedAt: new Date()
                },
                create: {
                    id: student.id + '-res',
                    studentId: student.id,
                    programId: student.programId,
                    semester,
                    academicYear: '2025-26',
                    sgpa,
                    cgpa,
                    status: 'PASS',
                    resultHash,
                    blockchainTxHash: txHash,
                    publishedAt: new Date()
                }
            });

            if (subjectResultsAvailable) {
                for (const sr of subjectResultsData) {
                    await prisma.subjectResult.upsert({
                        where: { resultId_courseId: { resultId: resultRecord.id, courseId: sr.courseId } },
                        update: {
                            internalMarks: sr.internalMarks,
                            externalMarks: sr.externalMarks,
                            totalMarks: sr.totalMarks,
                            grade: sr.grade,
                            creditsEarned: sr.creditsEarned
                        },
                        create: {
                            resultId: resultRecord.id,
                            courseId: sr.courseId,
                            internalMarks: sr.internalMarks,
                            externalMarks: sr.externalMarks,
                            totalMarks: sr.totalMarks,
                            grade: sr.grade,
                            creditsEarned: sr.creditsEarned
                        }
                    });
                }
            }

            console.log(`🎓 Demo Result for ${student.name} (${student.enrollmentNo}):`);
            console.log(`   SGPA: ${sgpa.toFixed(2)}, CGPA: ${cgpa.toFixed(2)}${Math.abs(derivedSgpa - sgpa) > 0.01 ? ` (normalized from ${derivedSgpa.toFixed(2)})` : ''}`);
            console.log(`   Hash: ${resultHash}`);
            console.log(`   Table Row: | **${student.name}** | \`${student.enrollmentNo}\` | \`${admitHash}\` | \`${resultHash}\` |`);
            console.log(`   Blockchain TX: ${txHash}\n`);
        }
    });

    // 21. Permissions (SuperAdmin)
    const superAdminId = '9be572c4-1fc9-48c3-9b30-631316853799';
    const modules = ['USERS', 'UNIVERSITIES', 'DEPARTMENTS', 'COURSES', 'STUDENTS', 'FACULTY', 'INQUIRIES', 'SUBSCRIBERS', 'NOTIFICATIONS', 'SETTINGS'];

    await seedIfTableExists('permissions', 'permission defaults', async () => {
        console.log('Seeding SuperAdmin Permissions...');
        for (const module of modules) {
            await prisma.permission.upsert({
                where: {
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

        console.log('Seeding UNI_ADMIN Permissions...');
        await prisma.permission.upsert({
            where: { id: 'perm-uniadmin-notifications-write' },
            update: { allowed: true, action: 'WRITE' },
            create: {
                id: 'perm-uniadmin-notifications-write',
                roleId: 'UNI_ADMIN',
                module: 'NOTIFICATIONS',
                action: 'WRITE',
                allowed: true,
            },
        });

        console.log('Seeding DEPT_ADMIN Permissions...');
        await prisma.permission.upsert({
            where: { id: 'perm-deptadmin-notifications-write' },
            update: { allowed: true, action: 'WRITE' },
            create: {
                id: 'perm-deptadmin-notifications-write',
                roleId: 'DEPT_ADMIN',
                module: 'NOTIFICATIONS',
                action: 'WRITE',
                allowed: true,
            },
        });
    });

    // 22. Job Postings — Hiring System Seed Data
    await seedIfTableExists('job_postings', 'job postings and demo applications', async () => {
    console.log('Seeding Job Postings & Demo Applications...');
    
    const demoJobs = [
        // SUPERADMIN jobs
        { id: 'job-sa-001', title: 'System Operations Manager',   description: 'Manage day-to-day operations of the SmartCampus OS platform. Responsible for reliability, performance monitoring, and cross-institutional support coordination.', type: 'FULL_TIME',  location: 'Remote (India)',    panelType: 'SUPERADMIN', panelId: null, departmentName: null,            universityName: null },
        { id: 'job-sa-002', title: 'Customer Support Executive',  description: 'Provide first-line support to universities and departments using SmartCampus OS. Handle tickets, resolve queries, and escalate critical issues.',                 type: 'FULL_TIME',  location: 'Surat, Gujarat',   panelType: 'SUPERADMIN', panelId: null, departmentName: null,            universityName: null },
        { id: 'job-sa-003', title: 'DevOps Engineer',             description: 'Maintain and automate CI/CD pipelines, manage cloud infrastructure, and ensure 99.9% uptime for the SmartCampus OS deployment.',                                     type: 'CONTRACT',   location: 'Remote (Worldwide)', panelType: 'SUPERADMIN', panelId: null, departmentName: null,            universityName: null },
        // UNIVERSITY jobs
        { id: 'job-uni-001', title: 'Professor – Computer Science', description: 'Lead teaching and research in core CS subjects including Data Structures, Algorithms, and Machine Learning. PhD required.',                                       type: 'FULL_TIME',  location: 'Surat, Gujarat',   panelType: 'UNIVERSITY',  panelId: null, departmentName: 'Computer Science', universityName: 'Veer Narmad South Gujarat University' },
        { id: 'job-uni-002', title: 'Lab Assistant – Electronics',  description: 'Support faculty in running electronics and embedded systems lab sessions. Maintain lab equipment and assist students.',                                              type: 'PART_TIME',  location: 'Surat, Gujarat',   panelType: 'UNIVERSITY',  panelId: null, departmentName: 'Electronics',      universityName: 'Veer Narmad South Gujarat University' },
        { id: 'job-uni-003', title: 'Academic Counsellor',          description: 'Guide students in academic planning, credit management, and career decision-making through one-on-one and group sessions.',                                          type: 'FULL_TIME',  location: 'Surat, Gujarat',   panelType: 'UNIVERSITY',  panelId: null, departmentName: null,            universityName: 'Veer Narmad South Gujarat University' },
        // DEPARTMENT jobs
        { id: 'job-dept-001', title: 'Lecturer – Data Science',  description: 'Deliver lectures on Data Science, Big Data, and AI. Minimum 2 years of industry or teaching experience required.',              type: 'FULL_TIME',  location: 'Surat, Gujarat',  panelType: 'DEPARTMENT', panelId: null, departmentName: 'Computer Science', universityName: 'Veer Narmad South Gujarat University' },
        { id: 'job-dept-002', title: 'Program Coordinator',       description: 'Coordinate department-level academic activities, exam planning, and student performance tracking.',                              type: 'FULL_TIME',  location: 'Surat, Gujarat',  panelType: 'DEPARTMENT', panelId: null, departmentName: 'Computer Science', universityName: 'Veer Narmad South Gujarat University' },
        { id: 'job-dept-003', title: 'Research Intern – AI/ML',   description: 'Collaborate with faculty on applied AI/ML research projects in academic resource management and intelligent scheduling systems.', type: 'INTERNSHIP', location: 'Remote / Hybrid', panelType: 'DEPARTMENT', panelId: null, departmentName: 'Computer Science', universityName: 'Veer Narmad South Gujarat University' },
    ];

        for (const job of demoJobs) {
            await prisma.jobPosting.upsert({
                where: { id: job.id },
                update: {
                    title: job.title,
                    description: job.description,
                    type: job.type,
                    location: job.location,
                    panelType: job.panelType,
                    departmentName: job.departmentName,
                    universityName: job.universityName,
                    isActive: true,
                },
                create: {
                    id: job.id,
                    title: job.title,
                    description: job.description,
                    type: job.type,
                    location: job.location,
                    panelType: job.panelType,
                    panelId: job.panelId,
                    departmentName: job.departmentName,
                    universityName: job.universityName,
                    isActive: true,
                },
            });
        }

    // Demo Applications for the first 3 jobs
    const demoApplicants = [
        { name: 'Arjun Mehta',    email: 'arjun.mehta@example.com',  mobile: '9876543210', jobId: 'job-sa-001' },
        { name: 'Priya Sharma',   email: 'priya.sharma@example.com', mobile: '9123456789', jobId: 'job-uni-001' },
        { name: 'Rahul Desai',    email: 'rahul.desai@example.com',  mobile: '9988776655', jobId: 'job-dept-001' },
    ];

        if (await tableExists('job_applications')) {
            for (const applicant of demoApplicants) {
                await prisma.jobApplication.upsert({
                    where: { id: `app-${applicant.jobId}` },
                    update: {
                        applicantName: applicant.name,
                        email: applicant.email,
                        mobile: applicant.mobile,
                        status: 'PENDING',
                    },
                    create: {
                        id: `app-${applicant.jobId}`,
                        jobId: applicant.jobId,
                        applicantName: applicant.name,
                        email: applicant.email,
                        mobile: applicant.mobile,
                        coverLetter: 'I am excited to apply for this position at SmartCampus OS. I believe my skills and experience make me a strong candidate.',
                        status: 'PENDING',
                    }
                });
            }
        }

        console.log(`✅ Seeded ${demoJobs.length} jobs and ${demoApplicants.length} demo applications.`);
    });
    
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
