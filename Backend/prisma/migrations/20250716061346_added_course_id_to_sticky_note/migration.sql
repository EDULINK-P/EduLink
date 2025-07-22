/*
  Warnings:

  - Added the required column `course_id` to the `StickyNote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StickyNote" ADD COLUMN     "course_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "StickyNote" ADD CONSTRAINT "StickyNote_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
