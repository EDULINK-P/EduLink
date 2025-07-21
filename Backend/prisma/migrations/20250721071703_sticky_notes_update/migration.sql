/*
  Warnings:

  - You are about to drop the `StickyNote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StickyNote" DROP CONSTRAINT "StickyNote_course_id_fkey";

-- DropForeignKey
ALTER TABLE "StickyNoteVersion" DROP CONSTRAINT "StickyNoteVersion_noteId_fkey";

-- DropTable
DROP TABLE "StickyNote";

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

    CONSTRAINT "StickyNotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StickyNotes_currentVersionId_key" ON "StickyNotes"("currentVersionId");

-- AddForeignKey
ALTER TABLE "StickyNotes" ADD CONSTRAINT "StickyNotes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StickyNotes" ADD CONSTRAINT "StickyNotes_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "StickyNoteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StickyNoteVersion" ADD CONSTRAINT "StickyNoteVersion_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "StickyNotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
