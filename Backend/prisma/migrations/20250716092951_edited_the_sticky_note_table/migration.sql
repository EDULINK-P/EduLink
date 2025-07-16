/*
  Warnings:

  - You are about to drop the column `updatedBy` on the `StickyNote` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `StickyNoteHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StickyNote" DROP COLUMN "updatedBy";

-- AlterTable
ALTER TABLE "StickyNoteHistory" DROP COLUMN "createdBy";
