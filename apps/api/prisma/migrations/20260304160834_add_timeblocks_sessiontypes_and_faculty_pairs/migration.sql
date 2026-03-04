-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "departmentId" TEXT;

-- AlterTable
ALTER TABLE "timetable_slots" ADD COLUMN     "blockId" TEXT,
ADD COLUMN     "faculty2Id" TEXT,
ADD COLUMN     "sessionTypeId" TEXT;

-- CreateTable
CREATE TABLE "time_blocks" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_types" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationRule" INTEGER NOT NULL DEFAULT 60,
    "roomTypeRequired" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elective_faculty_pairs" (
    "id" TEXT NOT NULL,
    "basketId" TEXT NOT NULL,
    "faculty1Id" TEXT NOT NULL,
    "faculty2Id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elective_faculty_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elective_subgroups" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "subgroupId" TEXT NOT NULL,
    "enrollmentCount" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elective_subgroups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_types" ADD CONSTRAINT "session_types_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elective_faculty_pairs" ADD CONSTRAINT "elective_faculty_pairs_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "elective_baskets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elective_faculty_pairs" ADD CONSTRAINT "elective_faculty_pairs_faculty1Id_fkey" FOREIGN KEY ("faculty1Id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elective_faculty_pairs" ADD CONSTRAINT "elective_faculty_pairs_faculty2Id_fkey" FOREIGN KEY ("faculty2Id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elective_subgroups" ADD CONSTRAINT "elective_subgroups_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "elective_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_faculty2Id_fkey" FOREIGN KEY ("faculty2Id") REFERENCES "faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "time_blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "session_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
