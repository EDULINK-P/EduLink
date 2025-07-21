-- AlterTable
ALTER TABLE "StickyNote" ADD COLUMN     "lastEditedBy" INTEGER,
ALTER COLUMN "currentVersionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StickyNote" ADD CONSTRAINT "StickyNote_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "StickyNoteVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
