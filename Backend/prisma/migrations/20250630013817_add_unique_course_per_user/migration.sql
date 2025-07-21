/*
  Warnings:

  - A unique constraint covering the columns `[user_id,course_id]` on the table `UserCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserCourse_user_id_course_id_key" ON "UserCourse"("user_id", "course_id");
