/*
  Warnings:

  - You are about to drop the `StickyNoteHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StickyNoteHistory" DROP CONSTRAINT "StickyNoteHistory_noteId_fkey";

-- DropTable
DROP TABLE "StickyNoteHistory";
