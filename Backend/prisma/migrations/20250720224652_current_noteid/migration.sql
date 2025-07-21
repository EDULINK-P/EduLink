-- DropForeignKey
ALTER TABLE "StickyNote" DROP CONSTRAINT "StickyNote_currentVersionId_fkey";

-- AlterTable
ALTER TABLE "StickyNote" ALTER COLUMN "currentVersionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StickyNote" ADD CONSTRAINT "StickyNote_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "StickyNoteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
