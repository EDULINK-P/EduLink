/*
  Warnings:

  - Added the required column `currentVersionId` to the `StickyNote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StickyNote" ADD COLUMN     "currentVersionId" INTEGER NOT NULL;
