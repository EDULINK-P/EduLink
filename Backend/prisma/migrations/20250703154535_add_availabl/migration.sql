/*
  Warnings:

  - You are about to drop the `StudyRoom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `zoomToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudyRoom" DROP CONSTRAINT "StudyRoom_course_id_fkey";

-- DropForeignKey
ALTER TABLE "StudyRoom" DROP CONSTRAINT "StudyRoom_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "zoomToken" DROP CONSTRAINT "zoomToken_user_id_fkey";

-- DropTable
DROP TABLE "StudyRoom";

-- DropTable
DROP TABLE "zoomToken";

-- CreateTable
CREATE TABLE "AvailabilityRequest" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "interval" JSONB NOT NULL,
    "rate" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AvailabilityRequest" ADD CONSTRAINT "AvailabilityRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityRequest" ADD CONSTRAINT "AvailabilityRequest_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
