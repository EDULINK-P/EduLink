/*
  Warnings:

  - You are about to drop the column `currentVersionId` on the `StickyNote` table. All the data in the column will be lost.
  - You are about to drop the column `lastEditedBy` on the `StickyNote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "StickyNote" DROP CONSTRAINT "StickyNote_currentVersionId_fkey";

-- DropIndex
DROP INDEX "StickyNote_currentVersionId_key";

-- AlterTable
ALTER TABLE "StickyNote" DROP COLUMN "currentVersionId",
DROP COLUMN "lastEditedBy";
