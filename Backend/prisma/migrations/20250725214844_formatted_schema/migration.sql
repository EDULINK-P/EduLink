/*
  Warnings:

  - You are about to drop the `StickyNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StickyNoteHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,course_id]` on the table `UserCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "StickyNote" DROP CONSTRAINT "StickyNote_course_id_fkey";

-- DropForeignKey
ALTER TABLE "StickyNoteHistory" DROP CONSTRAINT "StickyNoteHistory_noteId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rating" DOUBLE PRECISION,
ALTER COLUMN "credit" SET DEFAULT 60;

-- DropTable
DROP TABLE "StickyNote";

-- DropTable
DROP TABLE "StickyNoteHistory";

-- CreateTable
CREATE TABLE "StickyNotes" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedBy" INTEGER,
    "currentVersionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "StickyNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StickyNoteVersion" (
    "id" SERIAL NOT NULL,
    "noteId" INTEGER NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "editedBy" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StickyNoteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StickyNotes_currentVersionId_key" ON "StickyNotes"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCourse_user_id_course_id_key" ON "UserCourse"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "StickyNotes" ADD CONSTRAINT "StickyNotes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StickyNotes" ADD CONSTRAINT "StickyNotes_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "StickyNoteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StickyNotes" ADD CONSTRAINT "StickyNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StickyNoteVersion" ADD CONSTRAINT "StickyNoteVersion_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "StickyNotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
