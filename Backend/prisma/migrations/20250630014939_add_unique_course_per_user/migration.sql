/*
  Warnings:

  - A unique constraint covering the columns `[role]` on the table `UserCourse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserCourse_role_key" ON "UserCourse"("role");
