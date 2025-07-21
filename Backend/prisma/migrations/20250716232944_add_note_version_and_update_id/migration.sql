/*
  Warnings:

  - The primary key for the `StickyNote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `StickyNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lockedBy` column on the `StickyNote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `updatedAt` on table `StickyNote` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StickyNote" DROP CONSTRAINT "StickyNote_pkey",
ADD COLUMN     "content" TEXT NOT NULL DEFAULT 'New Sticky Note',
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "lockedBy",
ADD COLUMN     "lockedBy" INTEGER,
ALTER COLUMN "updatedAt" SET NOT NULL,
ADD CONSTRAINT "StickyNote_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "StickyNoteVersion" (
    "id" SERIAL NOT NULL,
    "noteId" INTEGER NOT NULL,
    "content" TEXT NOT NULL DEFAULT 'New Sticky Note',
    "editedBy" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StickyNoteVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StickyNoteVersion" ADD CONSTRAINT "StickyNoteVersion_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "StickyNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
