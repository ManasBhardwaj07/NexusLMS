-- DropIndex
DROP INDEX "course_title_trgm";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consentAt" TIMESTAMP(3);
