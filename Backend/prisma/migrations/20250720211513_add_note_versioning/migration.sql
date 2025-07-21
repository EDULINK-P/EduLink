/*
  Warnings:

  - A unique constraint covering the columns `[currentVersionId]` on the table `StickyNote` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "StickyNote" ADD COLUMN     "currentVersionId" INTEGER,
ADD COLUMN     "lastEditedBy" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "StickyNote_currentVersionId_key" ON "StickyNote"("currentVersionId");

-- AddForeignKey
ALTER TABLE "StickyNote" ADD CONSTRAINT "StickyNote_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "StickyNoteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
