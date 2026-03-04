-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "labDuration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "requiredRoomType" TEXT,
ADD COLUMN     "sessionTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "session_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
