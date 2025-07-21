/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `UserCourse` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[course_id]` on the table `UserCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserCourse_user_id_course_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserCourse_user_id_key" ON "UserCourse"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserCourse_course_id_key" ON "UserCourse"("course_id");
