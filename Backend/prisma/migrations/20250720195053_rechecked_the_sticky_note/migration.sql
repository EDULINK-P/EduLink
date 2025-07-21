/*
  Warnings:

  - Made the column `lockedBy` on table `StickyNote` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StickyNote" ALTER COLUMN "lockedBy" SET NOT NULL;
