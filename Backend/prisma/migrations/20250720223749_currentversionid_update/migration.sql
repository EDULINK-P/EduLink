/*
  Warnings:

  - Made the column `currentVersionId` on table `StickyNote` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "StickyNote" DROP CONSTRAINT "StickyNote_currentVersionId_fkey";

-- AlterTable
ALTER TABLE "StickyNote" ALTER COLUMN "currentVersionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "StickyNote" ADD CONSTRAINT "StickyNote_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "StickyNoteVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
